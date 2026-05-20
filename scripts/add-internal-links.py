#!/usr/bin/env python3
"""Add comprehensive internal linking to all 64 city service area pages."""

import os
import re

# City listings grouped by geographic cluster
CLUSTERS = {
    "camden": [
        "cherry-hill-nj", "haddonfield-nj", "voorhees-nj", "marlton-nj",
        "mount-laurel-nj", "moorestown-nj", "collingswood-nj", "pennsauken-nj",
        "camden-nj", "woodbury-nj", "mount-ephraim-nj", "willingboro-nj",
        "florence-nj", "medford-nj"
    ],
    "atlantic_cape": [
        "atlantic-city-nj", "egg-harbor-township-nj", "mays-landing-nj",
        "brigantine-nj", "hammonton-nj", "ocean-city-nj", "wildwood-nj",
        "cape-may-nj", "cape-may-court-house-nj"
    ],
    "ocean_monmouth": [
        "toms-river-nj", "brick-nj", "jackson-nj", "howell-nj",
        "freehold-nj", "manchester-township-nj", "beachwood-nj", "pemberton-nj"
    ],
    "mercer_burlington": [
        "trenton-nj", "hamilton-nj", "princeton-nj", "lawrenceville-nj",
        "burlington-nj"
    ],
    "gloucester_salem": [
        "glassboro-nj", "sewell-nj", "mullica-hill-nj", "paulsboro-nj",
        "carneys-point-nj", "salem-nj", "alloway-nj"
    ],
    "pa_suburbs": [
        "philadelphia-pa", "bensalem-pa", "bristol-pa", "levittown-pa",
        "king-of-prussia-pa", "norristown-pa", "doylestown-pa",
        "willow-grove-pa", "upper-darby-pa", "springfield-pa", "media-pa",
        "west-chester-pa", "downingtown-pa", "exton-pa", "bryn-mawr-pa",
        "chester-pa"
    ],
    "delaware": [
        "wilmington-de", "newark-de", "bear-de", "middletown-de", "new-castle-de"
    ]
}

# Human-readable display names
def display_name(slug):
    """Convert slug to display name."""
    parts = slug.replace('.html','').split('-')
    state = parts[-1].upper()
    city_parts = parts[:-1]
    name = ' '.join(w.capitalize() for w in city_parts)
    return f"{name}, {state}"

def get_nearby(slug, count=10):
    """Get nearby cities for a given city slug."""
    slug = slug.replace('.html','')
    # Find which cluster(s) this city belongs to
    primary_cluster = None
    for cluster_name, cities in CLUSTERS.items():
        if slug in cities:
            primary_cluster = cluster_name
            break
    if not primary_cluster:
        return []
    
    cities = CLUSTERS[primary_cluster]
    # Sort: prefer same-cluster cities, exclude self
    nearby = [c for c in cities if c != slug]
    
    # Add cross-cluster neighbors for border cities
    border_cross = {
        "cherry-hill-nj": ["philadelphia-pa", "bensalem-pa"],
        "camden-nj": ["philadelphia-pa"],
        "philadelphia-pa": ["camden-nj", "cherry-hill-nj", "pennsauken-nj"],
        "wilmington-de": ["chester-pa", "carneys-point-nj"],
        "trenton-nj": ["levittown-pa", "bristol-pa"],
        "bensalem-pa": ["trenton-nj", "burlington-nj"],
        "atlantic-city-nj": ["ocean-city-nj", "wildwood-nj"],
        "medford-nj": ["moorestown-nj", "mount-laurel-nj"],
        "pemberton-nj": ["medford-nj", "moorestown-nj"],
    }
    
    extra = border_cross.get(slug, [])
    for c in extra:
        if c not in nearby:
            nearby.append(c)
    
    return [n for n in nearby if n in get_all_slugs()][:count]

def get_all_slugs():
    """Get set of all valid city slugs."""
    all_slugs = set()
    for cities in CLUSTERS.values():
        all_slugs.update(cities)
    return all_slugs

def build_links_html(slug):
    """Build the nearby cities links HTML block."""
    nearby = get_nearby(slug, 10)
    if not nearby:
        return ""
    
    city_links = []
    for n in nearby:
        name = display_name(n)
        city_links.append(f'<li><a href="/service-areas/{n}.html">Gutter Guards & Lighting in {name}</a></li>')
    
    # Core service links
    core_links = [
        '<li><a href="/gutters.html">GutterGlove Gutter Guard Installation</a> — Premium stainless steel micro-mesh protection</li>',
        '<li><a href="/lighting.html">Oelo Permanent LED Roofline Lighting</a> — Year-round architectural & holiday lighting</li>',
        '<li><a href="/blog.html">Home Improvement Blog</a> — Expert gutter & lighting advice</li>',
        '<li><a href="/faq.html">Frequently Asked Questions</a> — Gutter guards & LED lighting FAQ</li>'
    ]
    
    return '\n'.join(city_links + core_links)

def process_page(filepath):
    """Replace the nearby service areas section in a city page."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    slug = os.path.basename(filepath).replace('.html','')
    new_links = build_links_html(slug)
    
    if not new_links:
        print(f"  SKIP: {slug} — no cluster found")
        return False
    
    # Replace the existing nearby section — multiple patterns to handle
    # Pattern: the entire "Explore Nearby Service Areas" section block
    pattern = r'(<section class="content"[^>]*>.*?<ul>\s*)(.*?)(\s*</ul>\s*</div>\s*</section>)'
    
    # More targeted: find the "Explore Nearby Service Areas" section and its help resources
    pattern2 = r'(<h2>Explore Nearby Service Areas</h2>.*?<ul>)\s*(.*?)\s*(</ul>\s*</div>\s*</section>)'
    
    if re.search(pattern2, content, re.DOTALL):
        new_block = f'<h2>Explore Nearby Service Areas</h2>\n      <p>We proudly serve communities throughout South Jersey, Eastern Pennsylvania, and Delaware. Check out our services in these nearby areas:</p>\n      <ul>\n        {new_links}\n      </ul>'
        
        # Remove the h3 Resources section too
        content = re.sub(r'\s*<h3>Helpful Resources</h3>\s*<ul>.*?</ul>', '', content, flags=re.DOTALL)
        
        content = re.sub(
            r'<h2>Explore Nearby Service Areas</h2>.*?</div>\s*</section>',
            f'{new_block}\n    </div>\n  </section>',
            content,
            flags=re.DOTALL
        )
        
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    else:
        print(f"  WARN: {slug} — no nearby section found")
        return False

def main():
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    areas_dir = os.path.join(base, 'service-areas')
    
    files = sorted(f for f in os.listdir(areas_dir) if f.endswith('.html'))
    updated = 0
    
    for f in files:
        filepath = os.path.join(areas_dir, f)
        result = process_page(filepath)
        if result:
            print(f"  OK: {f}")
            updated += 1
    
    print(f"\nDone. Updated {updated}/{len(files)} city pages.")

if __name__ == '__main__':
    main()
