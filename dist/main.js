/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./src/script.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
let menus;
let htmlMenus = document.querySelectorAll(".dropdown");
for (let menu of htmlMenus) {
  menus.push(new dropDownMenu(menu));
}

class dropDownMenu {
  constructor(_htmlMenu) {
    let listItems = _htmlMenu.querySelectorAll("li");

    for (let item of listItems) {
      if (item.classList.includes(".submenu-origin")) {
        this.appendSubmenuArrow(item);
      }
    }
  }

  appendSubmenuArrow(_item) {
    let svg = document.createElement("svg");
    let path = svg.querySelector("path");
    path.setAttribute(
      "d",
      "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
    );
  }
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOztVQUFBO1VBQ0E7Ozs7O1dDREE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vUFJPSkVDVCBOQU1FL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL1BST0pFQ1QgTkFNRS93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL1BST0pFQ1QgTkFNRS8uL3NyYy9zY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImxldCBtZW51cztcbmxldCBodG1sTWVudXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRyb3Bkb3duXCIpO1xuZm9yIChsZXQgbWVudSBvZiBodG1sTWVudXMpIHtcbiAgbWVudXMucHVzaChuZXcgZHJvcERvd25NZW51KG1lbnUpKTtcbn1cblxuY2xhc3MgZHJvcERvd25NZW51IHtcbiAgY29uc3RydWN0b3IoX2h0bWxNZW51KSB7XG4gICAgbGV0IGxpc3RJdGVtcyA9IF9odG1sTWVudS5xdWVyeVNlbGVjdG9yQWxsKFwibGlcIik7XG5cbiAgICBmb3IgKGxldCBpdGVtIG9mIGxpc3RJdGVtcykge1xuICAgICAgaWYgKGl0ZW0uY2xhc3NMaXN0LmluY2x1ZGVzKFwiLnN1Ym1lbnUtb3JpZ2luXCIpKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kU3VibWVudUFycm93KGl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFwcGVuZFN1Ym1lbnVBcnJvdyhfaXRlbSkge1xuICAgIGxldCBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3ZnXCIpO1xuICAgIGxldCBwYXRoID0gc3ZnLnF1ZXJ5U2VsZWN0b3IoXCJwYXRoXCIpO1xuICAgIHBhdGguc2V0QXR0cmlidXRlKFxuICAgICAgXCJkXCIsXG4gICAgICBcIk04LjU5LDE2LjU4TDEzLjE3LDEyTDguNTksNy40MUwxMCw2TDE2LDEyTDEwLDE4TDguNTksMTYuNThaXCJcbiAgICApO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=