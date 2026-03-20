(() => {
  const iframe = document.querySelector(".dragon-widget iframe");

  const sendDragonEvent = (action, data) => {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        type: "dragon-pointer",
        action,
        x: data.x,
        y: data.y,
        time: data.time
      },
      "*"
    );
  };

  let moveRaf = null;
  let lastMove = null;

  const queueMove = () => {
    moveRaf = null;
    if (!lastMove) return;
    sendDragonEvent("move", lastMove);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      lastMove = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      };
      if (!moveRaf) moveRaf = requestAnimationFrame(queueMove);
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerdown",
    (event) =>
      sendDragonEvent("down", {
        x: event.clientX,
        y: event.clientY,
        time: performance.now()
      }),
    { passive: true }
  );

  if (document.body) document.body.classList.remove("page-fade-out");

  const shouldAnimateLink = (link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return false;
    if (link.target && link.target.toLowerCase() === "_blank") return false;
    if (
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:")
    ) {
      return false;
    }

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
    return true;
  };

  const handleLinkClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.currentTarget;
    if (!shouldAnimateLink(link)) return;

    event.preventDefault();
    document.body.classList.add("page-fade-out");

    const targetUrl = link.href;
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 320);
  };

  const links = Array.from(document.querySelectorAll("a[href]"));
  links.forEach((link) => link.addEventListener("click", handleLinkClick));
})();
