# Tassel Hair & Beauty Studio - Website Setup Guide

## 📋 Overview

This guide will help you set up and deploy the Tassel Hair & Beauty Studio website. The website is built with vanilla HTML, CSS, and JavaScript (no frameworks required), making it lightweight, fast, and easy to maintain.

## 📦 What's Included

- `index.html` - Main HTML structure with all sections
- `styles.css` - Complete styling with Tassel brand colors
- `scripts.js` - Interactive features and animations
- `README.md` - Comprehensive project documentation

## 🎨 Brand Colors Used

The website uses Tassel's brand identity colors from your Kiddies menu:

- **Primary Beige**: #F5F1E8 (Backgrounds)
- **Primary Brown**: #6B5D52 (Headers & Text)
- **Accent Pink**: #E8B4C8 (Buttons & Highlights)
- **Secondary Beige**: #EDE6D9 (Cards & Sections)
- **Text Dark**: #4A4139 (Body Text)
- **Border Color**: #D4C5B3 (Dividers)

## 📁 Required Folder Structure

Create the following folder structure:

```
tassel-website/
├── index.html
├── styles.css
├── scripts.js
├── assets/
│   ├── images/
│   │   ├── hero-1.jpg
│   │   ├── hero-2.jpg
│   │   ├── hero-3.jpg
│   │   ├── about-salon.jpg
│   │   ├── service-wash.jpg
│   │   ├── service-braids.jpg
│   │   ├── service-cornrows.jpg
│   │   ├── service-undo.jpg
│   │   ├── service-kids.jpg
│   │   ├── service-plaits.jpg
│   │   ├── service-facial.jpg
│   │   ├── service-nails.jpg
│   │   ├── service-massage.jpg
│   │   ├── service-waxing.jpg
│   │   ├── gallery-1.jpg through gallery-8.jpg
│   │   ├── product-1.jpg through product-4.jpg
│   │   ├── client-1.jpg through client-3.jpg
│   │   ├── badge-certified.png
│   │   ├── badge-award.png
│   │   └── favicon.ico
│   ├── css/ (optional - for additional stylesheets)
│   └── js/ (optional - for additional scripts)
└── README.md
```

## 🖼️ Image Requirements

### Hero Images (3 slides)
- **Dimensions**: 1920x1080px (Full HD)
- **Format**: JPG
- **Content**: 
  - hero-1.jpg: Salon interior/happy customers
  - hero-2.jpg: Hair styling in progress
  - hero-3.jpg: Beauty spa treatment

### Service Images
- **Dimensions**: 800x600px
- **Format**: JPG
- **Content**: High-quality photos of each service type

### Gallery Images
- **Dimensions**: 600x600px (Square)
- **Format**: JPG
- **Content**: Before/after transformations, styled hair, beauty treatments

### Product Images
- **Dimensions**: 500x500px (Square)
- **Format**: JPG
- **Content**: Product photos on white background

### Client Testimonial Images
- **Dimensions**: 200x200px (Square)
- **Format**: JPG
- **Content**: Client profile photos (with permission)

### Other Images
- **favicon.ico**: 32x32px icon for browser tab
- **badge images**: 150x150px PNG with transparency

## 🚀 Quick Start Guide

### Step 1: Set Up Files

1. Create a new folder called `tassel-website`
2. Place `index.html`, `styles.css`, and `scripts.js` in the root
3. Create the `assets/images/` folder structure
4. Add all your images to the appropriate folders

### Step 2: Update Content

1. Open `index.html` in a code editor
2. Update the following placeholders:
   - Phone numbers (search for `+27 11 123 4567`)
   - Email addresses (search for `@tasselhairandbeauty.co.za`)
   - Physical address (search for `123 Beauty Avenue`)
   - Social media links (search for `href="#"`)
   - Google Maps embed URL (in the Contact section)

### Step 3: Add Your Images

Replace all image placeholder paths with your actual images:
- Update all `src="./assets/images/..."` paths
- Ensure image filenames match exactly

### Step 4: Test Locally

1. Open `index.html` in a web browser
2. Test all interactive features:
   - Navigation menu (including mobile)
   - Hero slider
   - Service tabs
   - Gallery filter and lightbox
   - Forms (booking, contact, login)
   - Modals
   - Scroll animations
   - Back to top button

### Step 5: Customize (Optional)

**To change colors:**
1. Open `styles.css`
2. Modify CSS variables in the `:root` section

**To add/remove services:**
1. Open `index.html`
2. Find the Services section
3. Copy/modify service card HTML

**To update prices:**
1. Search for price values in `index.html`
2. Update with current pricing

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Free)

1. Go to [netlify.com](https://www.netlify.com)
2. Sign up for free account
3. Drag and drop your `tassel-website` folder
4. Your site is live! Get a custom domain or use Netlify subdomain

### Option 2: GitHub Pages (Free)

1. Create a GitHub account
2. Create a new repository called `tassel-website`
3. Upload all files
4. Go to Settings > Pages
5. Select main branch as source
6. Site will be live at `yourusername.github.io/tassel-website`

### Option 3: Traditional Web Hosting

1. Purchase hosting (e.g., SiteGround, Bluehost, HostGator)
2. Purchase domain (e.g., tasselhairandbeauty.co.za)
3. Upload files via FTP or cPanel File Manager
4. Configure domain DNS

### Option 4: Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Import your repository
4. Automatic deployment on every update

## 🔗 Connecting to Backend

When you're ready to connect to the MongoDB backend:

### Step 1: Update API Endpoints

In `scripts.js`, find the form submission handlers and update with your API URLs:

```javascript
// Example: Contact form
fetch('https://your-api-domain.com/api/v1/contact', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
})
```

### Step 2: Add Authentication

When implementing user login:

```javascript
// Store JWT token
localStorage.setItem('token', response.token);

// Include token in API requests
headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Step 3: Dynamic Content

Replace static service listings with API data:

```javascript
fetch('/api/v1/services')
    .then(res => res.json())
    .then(data => {
        // Populate services dynamically
        renderServices(data.services);
    });
```

## 📱 Mobile Optimization

The website is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

All features are touch-optimized for mobile devices.

## 🎯 SEO Optimization

### Meta Tags (Already included in index.html)
- Title tag
- Meta description
- Keywords
- Open Graph tags (add these for social sharing)

### To Improve SEO:

1. **Add Structured Data** (JSON-LD):
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "Tassel Hair & Beauty Studio",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Beauty Avenue",
    "addressLocality": "Johannesburg",
    "addressRegion": "Gauteng",
    "postalCode": "2196",
    "addressCountry": "ZA"
  },
  "telephone": "+27-11-123-4567",
  "openingHours": "Mo-Fr 09:00-18:00, Sa 08:00-17:00, Su 10:00-16:00"
}
</script>
```

2. **Add Alt Text to All Images**
3. **Create sitemap.xml**
4. **Add robots.txt**
5. **Submit to Google Search Console**

## 🔒 Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Content Security Policy**: Add CSP headers
3. **Input Validation**: Validate all form inputs server-side
4. **XSS Prevention**: Already implemented (sanitized inputs)
5. **Rate Limiting**: Implement on backend API

## 📊 Analytics Integration

### Google Analytics

Add before closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Facebook Pixel

Add to `<head>` section for tracking conversions.

## 🧪 Testing Checklist

- [ ] All navigation links work
- [ ] Hero slider auto-plays and manual controls work
- [ ] Service tabs switch correctly
- [ ] Gallery filter works
- [ ] Lightbox opens and navigates
- [ ] All forms validate properly
- [ ] Modals open and close correctly
- [ ] Mobile menu toggles
- [ ] Responsive design works on all devices
- [ ] Images load correctly
- [ ] Smooth scrolling works
- [ ] Back to top button appears/disappears
- [ ] Animations trigger on scroll
- [ ] No console errors

## 🛠️ Troubleshooting

### Images Not Loading
- Check file paths are correct
- Ensure images exist in `assets/images/` folder
- Check file extensions match (JPG vs jpg)

### Styles Not Applied
- Verify `styles.css` is in same folder as `index.html`
- Check browser console for errors
- Clear browser cache

### JavaScript Not Working
- Verify `scripts.js` is linked correctly
- Check browser console for errors
- Ensure DOM is loaded before scripts run

### Mobile Menu Not Working
- Check JavaScript is loading
- Verify mobile toggle button exists
- Check CSS media queries

## 📞 Support

For technical support or questions:
- Email: dev@tasselhairandbeauty.co.za
- Phone: +27 XX XXX XXXX

## 📝 Maintenance

### Regular Updates
1. Update service prices seasonally
2. Add new gallery images monthly
3. Update testimonials regularly
4. Refresh blog content (if added)

### Performance Monitoring
1. Check page load speed monthly (use GTmetrix or PageSpeed Insights)
2. Monitor mobile usability (Google Search Console)
3. Review analytics for user behavior

## 🎓 Next Steps

1. **Add Blog Section**: Create a blog for hair care tips
2. **Online Booking System**: Integrate with booking API
3. **E-commerce**: Add shopping cart functionality
4. **Live Chat**: Add customer support chat
5. **Email Marketing**: Integrate with Mailchimp
6. **Payment Gateway**: Connect PayFast for online payments

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) - Browser compatibility
- [Google Fonts](https://fonts.google.com/)
- [Font Awesome Icons](https://fontawesome.com/)
- [Unsplash](https://unsplash.com/) - Free stock photos

## ✅ Launch Checklist

Before going live:

- [ ] All images optimized (compressed)
- [ ] Contact information updated
- [ ] Social media links added
- [ ] Google Analytics installed
- [ ] Domain purchased and configured
- [ ] SSL certificate installed
- [ ] All forms tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] Backup created
- [ ] 404 page created
- [ ] Privacy policy added
- [ ] Terms & conditions added

---

**Built with ❤️ for Tassel Hair & Beauty Studio**

Good luck with your website launch! 🚀✨
