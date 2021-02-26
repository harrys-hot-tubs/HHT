module.exports = {
  async redirects() {
    return [
      process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
        ? { source: "/((?!maintenance).*)", destination: "/maintenance.html", permanent: false }
        : null,
    ].filter(Boolean);
  }
}