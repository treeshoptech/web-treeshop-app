# TreeShop.app Website Structure

## Domain: treeshop.app

---

## 5 Main Divisions

### 1. **Main Section** (Homepage / General)
- Landing page
- Company overview
- Mission & vision
- General navigation hub to other divisions

### 2. **Ops Section** (Operations / Customer-Facing Services)
**Purpose:** Forestry mulching services, customer education, service offerings

**Key Features:**
- Service descriptions (Forestry Mulching, Tree Removal, Stump Grinding, etc.)
- Customer education about tree services
- How it works / Process explanations
- Quote calculator (customer-facing)
- Project gallery / Before & After
- Customer testimonials
- Service area information

**Target Audience:** Customers looking for tree services

---

### 3. **Tech Section** (Research & Solutions)
**Purpose:** App, tech solutions, research documentation, developer resources

**Key Features:**
- TreeShop app documentation
- API documentation
- Formula explanations (TreeScore, Mulching Score, etc.)
- Research papers & methodology
- Developer portal
- Product updates & changelog
- Technical blog posts
- Open source contributions (if any)

**Target Audience:** Developers, tech-minded users, partners, industry professionals

---

### 4. **Media Section** (Content Hub)
**Purpose:** Social media, blog, SEO/AEO, YouTube content

**Key Features:**
- Blog articles (tree care, industry news, how-tos)
- YouTube video embeds
- Social media feed aggregation
- Case studies
- Press releases
- Industry insights
- Educational content
- SEO-optimized landing pages
- Podcast episodes (if applicable)

**Target Audience:** Broader audience, content consumers, SEO traffic

---

### 5. **TreeShop Supply** (eCommerce)
**Purpose:** Sell forestry mulching equipment, merch, coaching, services

**Key Features:**
- Product catalog
  - Forestry mulching equipment
  - Tools & accessories
  - Safety gear
  - Branded merchandise (shirts, hats, gear)
- Digital products
  - Coaching programs
  - Training courses
  - Templates & calculators
  - Software licenses
- Shopping cart & checkout (Stripe integration)
- Product reviews & ratings
- Inventory management
- Order tracking

**Target Audience:** Tree service professionals, DIY enthusiasts, TreeShop customers

---

## Technical Architecture Notes

- **Main domain:** treeshop.app
- **Subdomain structure options:**
  - ops.treeshop.app (or treeshop.app/ops)
  - tech.treeshop.app (or treeshop.app/tech)
  - media.treeshop.app (or treeshop.app/media)
  - supply.treeshop.app (or treeshop.app/supply)

- **Current focus:** Work Order system (part of Tech/Ops backend)
- **Next phases:** Proposal system, then public-facing calculators

---

## Current Development Phase

**Building:** Work Order Management System (Internal Operations Tool)
- Time tracking for crews
- Line item management
- Production rate tracking
- Real-time updates
- Mulching Score implementation

**This feeds into:** Ops section (customer quotes) + Tech section (app documentation)
