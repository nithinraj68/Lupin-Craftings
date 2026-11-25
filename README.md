# Lupin Craftings website

A plain HTML website. No build step, no server needed. Open `index.html` to see it.

## Folder
- `index.html`, `car-covers.html`, `tyre-cushions.html`, `wall-art.html`, `tabletop.html`, `microfiber.html`, `esteem.html`, `contact.html`, `custom-orders.html` : the pages
- `images/` : every photo
- `js/content.js` : **phone, email, address, Instagram, and the whole Wall Art shop (models, sizes, prices)**
- `js/site.js` : shared header menu and footer
- `css/style.css` : small shared styles

## How to edit
- **Change a photo:** put the new photo in `images/` with the SAME file name as the old one (keep it under about 300 KB, JPG). Or use a new name and change the name in the page.
- **Phone, email, address, Instagram:** edit `js/content.js`.
- **Wall art models, sizes, prices:** edit `js/content.js`. Set `price: 4500` to show a price. `null` shows "Price on request".
- **Add a wall art model:** copy one `{ ... }` block in `models`, change the name and image.
- **Page text** (headings, paragraphs): open the page in any text editor or on GitHub (pencil icon) and change the words.
- **Microfiber and Esteem photos:** the dashed grey boxes in `microfiber.html` and `esteem.html` are placeholders. Replace each box with an `<img src="images/your-photo.jpg" alt="..." style="display:block;width:100%;height:auto">`. Use Esteem photos only with their written permission.

## Put it online with GitHub Pages
1. Create a free account at github.com and click **New repository**. Name it, for example, `lupin-craftings`. Keep it Public.
2. Click **uploading an existing file**, drag in everything from this folder (the pages, `images`, `js`, `css`), then **Commit changes**. Upload the files so `index.html` is at the top level of the repository.
3. Go to **Settings > Pages**. Under Source choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save. After a minute the site is live at `https://YOURNAME.github.io/lupin-craftings/`.
4. Buy your domain, then in **Settings > Pages > Custom domain** type it (for example `www.lupincraftings.com`) and Save. Tick **Enforce HTTPS** when it appears.
5. At your domain registrar, open DNS settings and add:
   - `CNAME` record: host `www`, value `YOURNAME.github.io`
   - For the bare domain (`lupincraftings.com`) add four `A` records with host `@`, pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   Check GitHub's current instructions at docs.github.com (search "Managing a custom domain for your GitHub Pages site") in case these change. DNS can take from a few minutes up to a day.

## Good to know
- The contact form and cart cannot send emails or take payments. They prepare a message the customer copies and sends on Instagram. For form emails, a free service like Formspree can be added. For online payments, a shop platform (Shopify, WooCommerce) or Razorpay is needed.
- Fonts load from Google Fonts, so the site needs internet to show them exactly.
- Brand logos, magazine pages and the Esteem name are other companies' property. Keep permissions in order.

## Login, reviews, WhatsApp
- See `SETUP-BACKEND.md` to turn on customer login, reviews (with your approval) and saved enquiries.
- WhatsApp number and Instagram links are set in `js/content.js` (`whatsapp`, `instagram`, `instagramDM`).
- Wall art price range is set in `js/content.js` (`priceRange`). Put exact prices per size in `sizes` to show them instead.
- Language: visitors can change language in the top bar. The first visit follows the browser's language. Translation is automatic by Google, so check important pages.
