import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  pageUrl: string;
  address?: string;
}

const WEBHOOK_URL = "https://aautomated-gutterleads.agents.runlobster.com/hooks/contact";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData: ContactFormData = await req.json();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.service) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: name, email, phone, and service are required'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Server configuration error'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        message: formData.message || '',
        page_url: formData.pageUrl,
      })
      .select()
      .maybeSingle();

    if (dbError || !data) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to save submission: ${dbError?.message || 'No data returned'}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Forward to webhook (fire-and-forget, non-blocking)
    EdgeRuntime.waitUntil(
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          message: formData.message || '',
          address: formData.address || '',
          pageUrl: formData.pageUrl,
          submittedAt: new Date().toISOString(),
          submissionId: data.id,
        }),
      }).catch((err) => console.error('Webhook delivery error:', err))
    );

    const emailBody = `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Service: ${formData.service}
Message: ${formData.message}

Submitted from: ${formData.pageUrl}
Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
    `;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'CleanGutters Lighting Co. <noreply@cleangutterslighting.com>',
            to: ['cleangutters2008@gmail.com'],
            reply_to: formData.email,
            subject: `New Lead: ${formData.service} - ${formData.name}`,
            text: emailBody
          })
        });

        if (response.ok) {
          const { error: updateError } = await supabase
            .from('contact_submissions')
            .update({ emailed: true })
            .eq('id', data.id);

          if (updateError) {
            console.error('Failed to update email status:', updateError);
          }
        } else {
          const errorText = await response.text();
          console.error('Resend API error:', errorText);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        id: data.id
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing form:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
