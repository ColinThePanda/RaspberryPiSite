const PORT = 8080;

interface ServerInfo {
  time: string;
  hostname: string;
  platform: string;
  arch: string;
  bunVersion: string;
  requestUrl: string;
  clientIp: string;
}

Bun.serve({
  port: PORT,
  hostname: '0.0.0.0',
  
  async fetch(req: Request, server): Promise<Response> {
    const url = new URL(req.url);
    let path = url.pathname;
    
    // Remove trailing slash except for root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // API endpoint for server info
    if (path === '/api/serverinfo') {
      const serverInfo: ServerInfo = {
        time: new Date().toLocaleString(),
        hostname: Bun.env.HOSTNAME || 'unknown',
        platform: process.platform,
        arch: process.arch,
        bunVersion: Bun.version,
        requestUrl: path,
        clientIp: server.requestIP(req)?.address || 'unknown'
      };
      
      return new Response(JSON.stringify(serverInfo), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Determine file path
    let filePath: string;
    
    if (path === '/') {
      filePath = './homepage/index.html';
    } else {
      // Try the path as-is first
      filePath = `.${path}`;
    }
    
    try {
      let file = Bun.file(filePath);
      
      // If file exists, serve it
      if (await file.exists()) {
        return new Response(file);
      }
      
      // If file doesn't exist, try adding /index.html
      const indexPath = `${filePath}/index.html`;
      file = Bun.file(indexPath);
      
      if (await file.exists()) {
        return new Response(file);
      }
      
      // File not found
      return new Response('404 - File Not Found', { status: 404 });
    } catch (err) {
      return new Response('500 - Internal Server Error', { status: 500 });
    }
  },
  
  error(error: Error): Response {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

console.log(`🚀 Bun server running at http://0.0.0.0:${PORT}/`);
console.log(`Access from your network at http://192.168.2.30:${PORT}/`);
console.log('Press Ctrl+C to stop the server');