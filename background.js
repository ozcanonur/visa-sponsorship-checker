let sponsorList;

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: 'Search for a visa',
    contexts: ['selection'],
    id: 'Search for visa!',
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  const url = chrome.runtime.getURL('./sponsor_list.csv');
  fetch(url).then((response) => {
    const readableStream = response.body;
    if (!readableStream) return;

    const reader = readableStream.getReader();
    const { selectionText } = info;

    let isFound = false;
    let match;

    return new ReadableStream({
      start: (controller) => {
        // The following function handles each data chunk
        const push = async () => {
          const { done, value } = await reader.read();

          // If there is no more data to read
          if (done) {
            console.log(match);

            controller.close();
            return;
          }

          // Get the data and send it to the browser via the controller
          controller.enqueue(value);

          const sponsorList = new TextDecoder('utf-8').decode(value);
          if (!selectionText) return;

          if (sponsorList.match(selectionText)) {
            isFound = true;
            match = sponsorList.match(selectionText);
          }

          push();
        };

        push();
      },
    });
  });
});
