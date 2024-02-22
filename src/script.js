import * as dom from "./dom-utilities.js";

class dropDownMenu {
  submenuOrigins = [];

  constructor(_htmlMenu) {
    const listItems = _htmlMenu.querySelectorAll("ul");

    for (const item of listItems) {
      if (item.classList.contains("submenu-origin")) {
        this.submenuOrigins.push(new SubmenuOrigin(item));
      }
    }

    this.attachHoverListener(_htmlMenu);
  }

  attachHoverListener(_htmlElem) {
    _htmlElem.addEventListener("mouseenter", (_event) => {
      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );
      let menuUnderMouse;
      for (const elem of underMouse) {
        if (elem.classList.contains("dropdown")) {
          menuUnderMouse = elem;
          break;
        }
      }
      if (!menuUnderMouse) return;

      const submenus = menuUnderMouse.querySelectorAll(".submenu-origin");
      console.log(submenus);
      for (const submenu of submenus) {
        submenu.classList.remove("highlighted");
        setTimeout(() => {
          submenu.classList.remove("opened");
        }, 500);
      }
    });
  }
}

class SubmenuOrigin {
  enterTime;
  htmlElem;
  menuOpenTimeout;
  menuCloseTimeout;

  constructor(_htmlElem) {
    this.appendSubmenuArrow(_htmlElem);
    this.attachHoverListener(_htmlElem);
    this.htmlElem = _htmlElem;
  }

  appendSubmenuArrow(_htmlElem) {
    const svg = dom.createSvg(
      "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
    );
    dom.createAppend(svg, "dropdown-expand-img", _htmlElem);
  }

  attachHoverListener(_htmlElem) {
    _htmlElem.addEventListener("mouseenter", () => {
      this.menuOpenTimeout = setTimeout(() => {
        _htmlElem.classList.add("opened");
        _htmlElem.classList.add("highlighted");
      }, 500);
      // clearTimeout(this.menuCloseTimeout);
    });

    _htmlElem.addEventListener("mouseleave", (_event) => {
      clearTimeout(this.menuOpenTimeout);

      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );
      let isMenuUnderMouse = false;

      for (const elem of underMouse) {
        if (elem.classList.contains("dropdown")) {
          isMenuUnderMouse = true;
          break;
        }
      }

      if (isMenuUnderMouse) {
        _htmlElem.classList.remove("highlighted");
        this.menuCloseTimeout = setTimeout(() => {
          _htmlElem.classList.remove("opened");
        }, 500);
      }
    });
  }
}

const menus = [];
const htmlMenus = document.querySelectorAll(".dropdown");
for (const menu of htmlMenus) {
  menus.push(new dropDownMenu(menu));
}
