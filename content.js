// @ts-nocheck
const chunks = [];
let isReady = false;

(async () => {
  const url = chrome.runtime.getURL('./sponsor_list.csv');
  const { body: readableStream } = await fetch(url);
  if (!readableStream) return;

  const reader = readableStream.getReader();

  return new ReadableStream({
    start: (controller) => {
      // The following function handles each data chunk
      const push = async () => {
        const { done, value: currentChunk } = await reader.read();
        const decodedChunk = new TextDecoder('utf-8').decode(currentChunk);

        // If there is no more data to read
        if (done) {
          isReady = true;
          controller.close();
          return;
        }

        // Get the data and send it to the browser via the controller
        controller.enqueue(currentChunk);

        chunks.push(decodedChunk);
        push();
      };

      push();
    },
  });
})();

setInterval(async () => {
  if (!isReady) return;

  // All company link elements
  const companyLinkElements = document.querySelectorAll('[data-control-name="job_card_company_link"]');

  for (const companyLinkElement of companyLinkElements) {
    // Check if the sponsor list has it
    for (const chunk of chunks) {
      const companyName = companyLinkElement.innerText;
      const container = companyLinkElement.parentElement.parentElement.parentElement.parentElement;

      if (!chunk.includes(companyName)) continue;

      container.style.backgroundColor = 'rgba(39, 167, 94, 0.1)';
      container.style.opacity = 1;
    }
  }
}, 500);
