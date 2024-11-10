const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Define the filename to operate on
const filename = 'example.txt';
const directory = __dirname; // The current directory

// Function to send a response with status and message
function sendResponse(res, statusCode, message, contentType = 'text/plain') {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(message);
}

// Create the server
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        // Serve the main HTML page with buttons
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File Operations</title>
                <style>
    /* Keyframes for animated background gradient */
    @keyframes gradientBackground {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* Keyframes for button pulsate effect */
    @keyframes pulsate {
        0% { box-shadow: 0 0 8px rgba(95, 186, 233, 0.5); }
        50% { box-shadow: 0 0 18px rgba(95, 186, 233, 1); }
        100% { box-shadow: 0 0 8px rgba(95, 186, 233, 0.5); }
    }

    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #ff7e5f, #feb47b, #86a8e7, #91eae4);
        background-size: 200% 200%;
        animation: gradientBackground 10s ease infinite;
        color: #343a40;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    h1 {
        color: #ffffff;
        font-size: 2.5em;
        margin-bottom: 20px;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
    }

    button {
        margin: 10px;
        padding: 12px 20px;
        font-size: 18px;
        cursor: pointer;
        background: linear-gradient(135deg, #56ccf2, #2f80ed);
        color: white;
        border: none;
        border-radius: 8px;
        animation: pulsate 2s infinite; /* Apply pulsate animation */
        transition: background 0.3s, transform 0.3s;
    }

    button:hover {
        background: linear-gradient(135deg, #2f80ed, #56ccf2);
        transform: scale(1.05); /* Slightly enlarge button on hover */
    }

    .result {
        margin-top: 20px;
        padding: 15px;
        width: 80%;
        max-width: 500px;
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        color: #333;
        white-space: pre-wrap;
    }

    @media (max-width: 600px) {
        button {
            width: 100%;
        }
    }
</style>


            </head>
            <body>
                <h1>File Operations Server</h1>
                <button onclick="performOperation('read')">Read File</button>
                <button onclick="performOperation('write')">Write File</button>
                <button onclick="performOperation('delete')">Delete File</button>
                <button onclick="performOperation('list')">List Files</button>
                <div class="result" id="result"></div>
                <script>
                    function performOperation(operation) {
                        let url;
                        if (operation === 'write') {
                            const content = prompt("Enter content to write to example.txt:");
                            if (!content) return; // Cancel if no content entered
                            url = '/write';
                            fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'text/plain',
                                },
                                body: content
                            }).then(response => response.text()).then(data => {
                                document.getElementById('result').innerText = data;
                            });
                        } else {
                            url = '/' + operation;
                            fetch(url)
                                .then(response => response.text())
                                .then(data => {
                                    document.getElementById('result').innerText = data;
                                });
                        }
                    }
                </script>
            </body>
            </html>
        `;
        sendResponse(res, 200, html, 'text/html');
    } else if (pathname === '/read') {
        // Read the contents of example.txt
        fs.readFile(path.join(directory, filename), 'utf8', (err, data) => {
            if (err) {
                return sendResponse(res, 500, 'Error reading file: ' + err.message);
            }
            sendResponse(res, 200, 'File Contents:\n' + data);
        });
    } else if (pathname === '/write' && req.method === 'POST') {
        // Write content to example.txt
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            fs.writeFile(path.join(directory, filename), body, (err) => {
                if (err) {
                    return sendResponse(res, 500, 'Error writing to file: ' + err.message);
                }
                sendResponse(res, 200, 'File written successfully!');
            });
        });
    } else if (pathname === '/delete') {
        // Delete example.txt
        fs.unlink(path.join(directory, filename), (err) => {
            if (err) {
                return sendResponse(res, 500, 'Error deleting file: ' + err.message);
            }
            sendResponse(res, 200, 'File deleted successfully!');
        });
    } else if (pathname === '/list') {
        // List all files in the directory
        fs.readdir(directory, (err, files) => {
            if (err) {
                return sendResponse(res, 500, 'Error reading directory: ' + err.message);
            }
            sendResponse(res, 200, 'Files in directory:\n' + files.join('\n'));
        });
    } else {
        // Handle 404 - Not Found
        sendResponse(res, 404, '404 Not Found');
    }
}).listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
