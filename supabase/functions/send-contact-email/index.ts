import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData: ContactFormData = await req.json();
    
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

    const emailData = {
      to: 'cleangutters2008@gmail.com',
      subject: `New Contact Form: ${formData.service} - ${formData.name}`,
      text: emailBody,
      from: 'noreply@cleangutters.com',
      replyTo: formData.email
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'CleanGutters Contact Form <onboarding@resend.dev>',
        to: ['cleangutters2008@gmail.com'],
        reply_to: formData.email,
        subject: `New Contact: ${formData.service} - ${formData.name}`,
        text: emailBody
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', id: result.id }),
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