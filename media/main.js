const vscode = acquireVsCodeApi();

const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const msgContainer = document.getElementById('messages');

function sendMessage() {
  const input = promptInput.value.trim();
  if (!input) return;

  msgContainer.innerHTML += `<div class="msg user"><b>You:</b> <br>` + escapeHtml(input).replace(/\n/g, '<br>') + `</div>`;
  vscode.postMessage({ type: 'sendMessage', value: input });
  promptInput.value = '';
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);

// Auto-submit on Enter (Shift+Enter for new line)
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function renderMarkdown(text) {
  // First extract code blocks to protect them from other formatting
  const codeBlocks = [];
  let processed = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const id = codeBlocks.length;
    codeBlocks.push({ lang, code: code.trim() });
    return `___CODEBLOCK_${id}___`;
  });
  
  // Basic markdown formatting
  processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  processed = processed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  processed = processed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  processed = processed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  processed = processed.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  processed = processed.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  
  
  // Command blocks
  processed = processed.replace(/<run_command>([\s\S]*?)<\/run_command>/g, (match, cmd) => {
    const encoded = encodeURIComponent(cmd.trim());
    return `<div class="code-block command-block">
      <div class="code-header">Terminal Command <button class="run-cmd-btn" data-cmd="${encoded}">Run Command</button></div>
      <pre><code>${escapeHtml(cmd.trim())}</code></pre>
    </div>`;
  });

  // Line breaks
  processed = processed.replace(/\n/g, '<br>');

  // Restore code blocks with Apply button
  processed = processed.replace(/___CODEBLOCK_(\d+)___/g, (match, id) => {
    const block = codeBlocks[id];
    const encoded = encodeURIComponent(block.code);
    return `<div class="code-block">
      <div class="code-header">${block.lang || 'code'} <button class="apply-btn" data-code="${encoded}">Apply Code</button></div>
      <pre><code>${escapeHtml(block.code)}</code></pre>
    </div>`;
  });

  return processed;
}

window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'receiveMessage':
      const replyHtml = renderMarkdown(message.value);
      msgContainer.innerHTML += `<div class="msg alice"><b>Alice:</b> <br>` + replyHtml + `</div>`;
      msgContainer.scrollTop = msgContainer.scrollHeight;
      
      // Attach events to new buttons
      document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.onclick = (e) => {
          const code = decodeURIComponent(e.target.getAttribute('data-code'));
          vscode.postMessage({ type: 'applyCode', value: code });
        };
      });
      
      // Attach events to run command buttons
      document.querySelectorAll('.run-cmd-btn').forEach(btn => {
        btn.onclick = (e) => {
          const cmd = decodeURIComponent(e.target.getAttribute('data-cmd'));
          e.target.innerText = "Running...";
          e.target.disabled = true;
          vscode.postMessage({ type: 'runCommand', value: cmd });
        };
      });

      break;
    case "commandResult":
      const resHtml = `<div class="msg user"><b>Command Output:</b><br><pre><code>${escapeHtml(message.value)}</code></pre></div>`;
      document.getElementById("messages").innerHTML += resHtml;
      document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
      vscode.postMessage({ type: "sendMessage", value: "Command Output:\n" + message.value });
      break;
  }
});
