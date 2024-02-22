import * as dom from "./dom-utilities.js";

class Dropdown {
  origins = [];

  constructor(_htmlMenu) {
    this.origins.push(new DropdownOrigin(_htmlMenu));
    const suborigins = _htmlMenu.querySelectorAll(".dropdown-expand");

    for (const origin of suborigins) {
      this.origins.push(new DropdownOrigin(origin));
    }

    this.attachHoverListener(_htmlMenu);
    this.attachClickListener(_htmlMenu);
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

      const submenus = menuUnderMouse.querySelectorAll(
        ".dropdown-expand, .dropdown-anchor"
      );

      for (const submenu of submenus) {
        submenu.classList.remove("highlighted");
        submenu.menuCloseTimeout = setTimeout(() => {
          if (!submenu.classList.contains("highlighted")) {
            submenu.classList.remove("opened");
          }
        }, 500);
      }
    });
  }

  attachClickListener(_htmlElem) {
    document.addEventListener("click", (_event) => {
      if (
        _htmlElem.classList.contains("opened") &&
        !dom.elementIsOrContainsElement(_htmlElem, _event.target)
      ) {
        this.origins.forEach((_origin) => {
          _origin.htmlElem.classList.remove("highlighted");
          _origin.htmlElem.classList.remove("opened");
        });
      }
    });
  }
}

class DropdownOrigin {
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
      _htmlElem.classList.add("highlighted");
      this.menuOpenTimeout = setTimeout(() => {
        _htmlElem.classList.add("opened");
        clearTimeout(this.menuCloseTimeout);
      }, 500);
    });

    _htmlElem.addEventListener("mouseleave", (_event) => {
      clearTimeout(this.menuOpenTimeout);

      const underMouse = document.elementsFromPoint(
        _event.clientX,
        _event.clientY
      );

      if (dom.nodeListContainsClass(underMouse, "dropdown")) {
        _htmlElem.classList.remove("highlighted");
        this.menuCloseTimeout = setTimeout(() => {
          if (!_htmlElem.classList.contains("highlighted")) {
            _htmlElem.classList.remove("opened");
          }
        }, 500);
      }
    });
  }
}

const menus = [];
const htmlMenus = document.querySelectorAll(".dropdown-anchor");
for (const menu of htmlMenus) {
  menus.push(new Dropdown(menu));
}
