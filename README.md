# May Madness Scoring App

A tournament scoring application built with Next.js.

## 📁 Project Structure

```
may-madness-scoring/
├── src/
│   └── app/                    # Your application code lives here
│       ├── layout.js           # The main layout (wraps all pages)
│       ├── page.js             # Home page (localhost:3000/)
│       └── globals.css         # Global styles
├── public/                     # Static files (images, icons)
├── package.json                # Dependencies and scripts
└── next.config.mjs             # Next.js configuration
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📖 Key Concepts for Beginners

### Pages & Routing
- Each file in `src/app/` becomes a page automatically
- `page.js` = the page content
- `layout.js` = shared wrapper for pages
- Create `src/app/about/page.js` to add an `/about` page

### Components
- Components are reusable pieces of UI
- They're just JavaScript functions that return JSX (HTML-like syntax)
- Example: `<FeatureCard title="Hello" />` 

### Styling with Tailwind CSS
- Add styles directly in className attributes
- Example: `className="text-lg font-bold text-blue-500"`
- No separate CSS files needed!

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs) - Official documentation
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial (great for beginners!)
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling reference
