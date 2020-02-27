export function getModalHtml(message: string, terminalCode?: string): string {
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
    if (line.startsWith('$ atlas --')) {
      return `<span class="shell-prompt">$ atlas</span> <span class="shell-option">--${line.substr(10)}</span>`;
    }
    if (line.startsWith('$ atlas')) {
      return `<span class="shell-prompt">$ atlas</span>${line.substr(7)}`;
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
        background: #DCEDC8;
        border-radius: 50%;
        padding: 0.25rem;
      }

      .modal__text {
        flex: 1;
        align-self: center;
        text-align: center;
      }

      .icon {
        border-radius: 50%;
        color: #097b57;
      }

      p {
        margin: 0;
        margin-bottom: 1rem;
        padding: 0;
      }

      pre {
        background: #262822;
        color: #f5f5f5;
        padding: 0 1.5rem;
        border-radius: 0.5rem;
        font-size: 1.125rem;
        margin: 0;
        margin-top: 0.5rem;
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
          <div class="icon">
            <svg style="width:48px;height:48px" viewBox="0 0 48 48">
              <g transform="scale(2)">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" />
              </g>
            </svg>
          </div>
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
