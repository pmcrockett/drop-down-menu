import createMenus, { getMenuItems } from "./os-like-dropdown.js";

createMenus();

const menuItems = getMenuItems();
const logTextElem = document.querySelector(".log-text");

menuItems.forEach((_item) => {
  _item.addEventListener("mousedown", (_event) => {
    if (_event.button === 0 && _item.getAttribute("enabled") !== "false") {
      console.log(`Clicked ${_item.getAttribute("id")}`);
      logTextElem.textContent = `Clicked ${_item.getAttribute("id")}`;
    }
  });
});
