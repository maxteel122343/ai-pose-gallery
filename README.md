# POSE Atlas — AI Pose Reference Gallery (React)

A modern, high-performance React application for browsing and inspecting **1,439 AI pose reference images** (288 unique human poses across 5 camera angles).

Designed as reference for AI image generation (Stable Diffusion, FLUX, Midjourney, ControlNet, IP-Adapter, and composition studies).

## Features

- **React + TypeScript + Vite**: Built with functional components and clean state management.
- **Series & Category Navigation**: Filter across full body (sexy, standard), upper body, and couple poses.
- **Multi-Angle Switching**: Front, High angle, Low angle, Side, and Diagonal views.
- **Grouped & Single Views**: Switch seamlessly between grouped poses and individual angle views.
- **Real-Time Search**: Instant filtering by pose title, number, ID, or category (press `/` to search).
- **Interactive Viewer Modal**:
  - Full-resolution 900×1200 PNG download and preview
  - Keyboard navigation (`←` / `→` for angles, `↑` / `↓` for poses, `Esc` to close)
  - Mobile swipe gestures for switching angles
  - Copy Pose ID to clipboard with one click
- **Theme Support**: Seamless Dark and Light theme toggle with `localStorage` persistence.
- **Responsive Design**: Optimized for desktops, tablets, and mobile devices.

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Data & Credits

- Original pose database by [@giaaibusi](https://x.com/giaaibusi)
- Original Chinese edition layout & compilation by [Anhao](https://github.com/anhao/ai-pose-gallery-zh)
- Multi-angle images served via public high-speed mirror.
