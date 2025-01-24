// Create web server
// Get comments from comments.txt
// Show comments on the page
// Add a form to add comments
// Add a button to delete comments
// Add a button to edit comments

// Require modules
const http = require('http');
const fs = require('fs');
const url = require('url');

// Create server
http.createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/') {
        fs.readFile('comments.txt', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<h1>Comments</h1>');
                res.write('<ul>');
                const comments = data.split('\n');
                comments.forEach((comment, index) => {
                    res.write(`<li>${comment} <button onclick="deleteComment(${index})">Delete</button> <button onclick="editComment(${index})">Edit</button></li>`);
                });
                res.write('</ul>');
                res.write('<form action="/add" method="POST">');
                res.write('<input type="text" name="comment" placeholder="Add a comment">');
                res.write('<input type="submit" value="Add">');
                res.write('</form>');
                res.write('<script>');
                res.write('function deleteComment(index) {');
                res.write('fetch(`/delete?index=${index}`).then(() => location.reload());');
                res.write('}');
                res.write('function editComment(index) {');
                res.write('const comment = prompt("Edit the comment:");');
                res.write('fetch(`/edit?index=${index}&comment=${comment}`).then(() => location.reload());');
                res.write('}');
                res.write('</script>');
                res.end();
            }
        });
    } else if (pathname === '/add') {
        let comment = '';
        req.on('data', data => {
            comment += data;
        });
        req.on('end', () => {
            comment = comment.split('=')[1];
            fs.appendFile('comments.txt', `${comment}\n`, err => {
                if (err) {
                    console.log(err);
                } else {
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                }
            });
        });
    } else if (pathname === '/delete') {
        const query = url.parse(req.url, true).query;
        const index = parseInt(query.index, 10);
        fs.readFile('comments.txt', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const comments = data.split('\n');
                comments.splice(index, 1);
                fs.writeFile('comments.txt', comments.join('\n'), err => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.writeHead(302, { 'Location': '/' });
                        res.end();
                    }
                });
            }
        });
    } else if (pathname === '/edit') {
        const query = url.parse(req.url, true).query;
        const index = parseInt(query.index, 10);
        const newComment = query.comment;
        fs.readFile('comments.txt', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const comments = data.split('\n');
                comments[index] = newComment;
                fs.writeFile('comments.txt', comments.join('\n'), err => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.writeHead(302, { 'Location': '/' });
                        res.end();
                    }
                });
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.write('<h1>404 Not Found</h1>');
        res.end();
    }
