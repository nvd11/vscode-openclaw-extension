const vscode = acquireVsCodeApi();

document.getElementById('send-btn').addEventListener('click', () => {
  const input = document.getElementById('prompt-input').value;
  if (!input) return;

  const msgContainer = document.getElementById('messages');
  msgContainer.innerHTML += `<div class="msg user"><b>You:</b> ` + input + `</div>`;

  vscode.postMessage({ type: 'sendMessage', value: input });
  document.getElementById('prompt-input').value = '';
});

window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'receiveMessage':
      const msgContainer = document.getElementById('messages');
      // Simple parser to find code blocks and add apply buttons
      const replyHtml = message.value.replace(/```([\s\S]*?)```/g, (match, p1) => {
          const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
          // Save code in a data attribute
          const encoded = encodeURIComponent(p1.trim());
          return `<div class="code-block">
            <pre><code>${p1.trim()}</code></pre>
            <button class="apply-btn" data-code="${encoded}">Apply Code</button>
          </div>`;
      });

      msgContainer.innerHTML += `<div class="msg alice"><b>Alice:</b> ` + replyHtml + `</div>`;
      
      // Attach events to new buttons
      document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.onclick = (e) => {
          const code = decodeURIComponent(e.target.getAttribute('data-code'));
          vscode.postMessage({ type: 'applyCode', value: code });
        };
      });
      break;
  }
});
