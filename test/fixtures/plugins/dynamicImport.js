// source: https://github.com/tc39/proposal-dynamic-import
const main = document.querySelector("main");
for (const link of document.querySelectorAll("nav > a")) {
  link.addEventListener("click", e => {
    e.preventDefault();

    import(`./section-modules/${link.dataset.entryModule}.js`)
      .then(module => {
        module.loadPageInto(main);
      })
      .catch(err => {
        main.textContent = err.message;
      });
  });
}