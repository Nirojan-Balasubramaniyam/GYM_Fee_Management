const http = require("http");
const fs = require("fs").promises;
const path = require("path");

async function renderPage(layoutFile, contentFile) {
  try {
    let layout = await fs.readFile(layoutFile, "utf8");
    let content = await fs.readFile(contentFile, "utf8");

    // Extract <style> block
    const styleStart = content.indexOf("<style>");
    const styleEnd = content.indexOf("</style>");

    let style = "";
    if (styleStart !== -1 && styleEnd !== -1) {
      style = content.substring(styleStart, styleEnd + "</style>".length);
      content =
        content.substring(0, styleStart) +
        content.substring(styleEnd + "</style>".length);
    }

    // Extract <script> block
    const scriptStart = content.indexOf("<script>");
    const scriptEnd = content.indexOf("</script>");

    let script = "";
    if (scriptStart !== -1 && scriptEnd !== -1) {
      script = content.substring(scriptStart, scriptEnd + "</script>".length);
      content =
        content.substring(0, scriptStart) +
        content.substring(scriptEnd + "</script>".length);
    }

    // Replace placeholders with actual content
    const renderedPage = layout
      .replace("{{content}}", content)
      .replace("{{style}}", style)
      .replace("{{script}}", script);

    return renderedPage;
  } catch (err) {
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  // Handle static file requests
  if (req.url.startsWith("/static/")) {
    const filePath = path.join(__dirname, req.url);
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      res.end(data);
      return;
    } 
    catch (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h1>404 Not Found</h1>");
    }
  } 

  // Handle user page requests
  let filePath = "./views/Member/home.html";
  let layout_use = "./layouts/layout-member.html";

  if (req.url === "/") {
    filePath = "./views/Public/home.html";
    layout_use = "./layouts/layout-public.html";
  }
  else if (req.url === "/calculate") {
    filePath = "./views/Public/calculate.html";
    layout_use = "./layouts/layout-public.html";
  }
  else if (req.url === "/training") {
    filePath = "./views/Public/training.html";
    layout_use = "./layouts/layout-public.html";
  }
  else if (req.url === "/about") {
    filePath = "./views/Public/aboutus.html";
    layout_use = "./layouts/layout-public.html";
  }
  else if (req.url === "/login") {
    filePath = "./views/Public/login.html";
    layout_use = "./layouts/layout-public.html";
  }

  //handle logged in member page requests
  else if (req.url === "/member") {
    filePath = "./views/Member/profile.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/profile") {
    filePath = "./views/Member/profile.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/bmi") {
    filePath = "./views/Member/bmi.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/payment-history") {
    filePath = "./views/Member/payment-history.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/make-payment") {
    filePath = "./views/Member/make-payment.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/change-program") {
    filePath = "./views/Member/change-program.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/change-info") {
    filePath = "./views/Member/change-info.html";
    layout_use = "./layouts/layout-member.html";
  }
  else if (req.url === "/notification") {
    filePath = "./views/Member/notification.html";
    layout_use = "./layouts/layout-member.html";
  }
  
 

  //Handle admin page requests
  else if (req.url === "/admin") {
    filePath = "./views/Admin/dashboard.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/member-management") {
    filePath = "./views/Admin/member-management.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/approval-requests") {
    filePath = "./views/Admin/approval-requests.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/payment") {
    filePath = "./views/Admin/payment.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/enroll-program") {
    filePath = "./views/Admin/enroll-program.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/user-reports") {
    filePath = "./views/Admin/user-reports.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/program-reports") {
    filePath = "./views/Admin/program-reports.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/payment-reports") {
    filePath = "./views/Admin/payment-reports.html";
    layout_use = "./layouts/layout-admin.html";
  }
  else if (req.url === "/logout") {
    filePath = "./views/Public/login.html";
    layout_use = "./layouts/layout-public.html";
  }


  else {
    res.writeHead(404, { "Content-Type": "text/html" });
    return res.end("<h1>404 Not Found</h1>");
  }


  try {
    let renderedPage = await renderPage(layout_use, filePath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(renderedPage);
  }
   catch (err) {
    console.log(err);
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end("<h1>500 Internal Server Error</h1>");
  }
});

// Function to determine content type
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".html":
      return "text/html";
    default:
      return "application/octet-stream";
  }
}

const PORT = process.env.PORT || 7200;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
