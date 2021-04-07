export function getModalHtml(svgHtml: string, message: string, terminalCode?: string): string {
  const messageHtml = message
    .split('\n\n')
    .map((line: string) => `<p>${line}</p>`)
    .join('\n');
  const terminalCodeHtml =
    terminalCode == null
      ? ''
      : `
<pre>
${terminalCode
  .split('\n')
  .map((splitLine: string) => {
    const line = splitLine.trim();
    if (line.startsWith('#')) {
      return `<span class="comment">${line}</span>`;
    }
    if (line.startsWith('$ pc --')) {
      return `<span class="shell-prompt">$ pc</span> <span class="shell-option">--${line.substr(10)}</span>`;
    }
    if (line.startsWith('$ pc')) {
      return `<span class="shell-prompt">$ pc</span>${line.substr(7)}`;
    }
    return line;
  })
  .join('\n')}
</pre>
  `;
  return `
  <html>
  <head>
    <style>
      body {
        display: flex;
        height: 100%;
        font-family: sans-serif;
        background: rgb(107, 114, 128, 0.75);
      }

      .modal__outer {
        display: flex;
        flex-direction: column;
        flex: 1;
        align-self: center;
      }

      .modal {
        display: flex;
        flex-direction: column;
        align-self: center;
        width: 25rem;
        padding: 1.5rem;
        border: 0 solid #d2d6dc;
        border-radius: 0.5rem;
        background: #fff;
        color: #6b7280;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
        text-align: left;
      }

      .modal__icon {
        flex: 0;
        align-self: center;
        margin-bottom: 1.5rem;
      }

      .modal__text {
        flex: 1;
        align-self: center;
        text-align: center;
      }

      .icon {
        padding: 0.25rem;
        border-radius: 20%;
      }

      .icon--login {
        background: #DCEDC8;
        color: #097b57;
      }

      .icon--logout {
        background: #E0E0E0;
        color: #6a7280;
      }

      p {
        margin: 0;
        margin-bottom: 1rem;
        padding: 0;
      }

      pre {
        padding: 0 1.5rem;
        font-size: 1.125rem;
        margin: 0;
        margin-top: 0.5rem;
        border-radius: 0.5rem;
        background: #262822;
        color: #f5f5f5;
      }

      .comment {
        color: #9E9E9E;
      }

      .shell-prompt {
        color: #FF9800;
      }

      .shell-option {
        color: #9dd52e;
      }
    </style>
  </head>
  <body style="">
    <div class="modal__outer">
      <div class="modal">
        <div class="modal__icon">
          ${svgHtml}
        </div>
        <div class="modal__text">
          ${messageHtml}
        </div>
        ${terminalCodeHtml == null ? '' : terminalCodeHtml}
      </div>
    </div>
  </body>
  </html>
  `;
}
