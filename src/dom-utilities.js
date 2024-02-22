export function freeze(_htmlElem, _excludeSelector) {
  _htmlElem.classList.add("freeze");
  const focusable = _htmlElem.querySelectorAll(
    `[tabindex="0"]${_excludeSelector}`
  );
  for (const elem of focusable) {
    elem.setAttribute("tabindex", "-1");
  }
}

export function thaw(_htmlElem, _excludeSelector) {
  _htmlElem.classList.remove("freeze");
  const focusable = _htmlElem.querySelectorAll(
    `[tabindex="-1"]${_excludeSelector}`
  );
  for (const elem of focusable) {
    elem.setAttribute("tabindex", "0");
  }
}

export function createAppend(_elemType, _classes, _parentElem, _textContent) {
  // If _elemType is a string, create it; otherwise assume it's an existing
  // element and use it as passed.
  let elem;
  if (typeof _elemType == "string") {
    elem = document.createElement(_elemType);
  } else {
    elem = _elemType;
  }

  addClasses(elem, _classes);

  if (_textContent) {
    elem.textContent = _textContent;
  }

  _parentElem.appendChild(elem);

  return elem;
}

export function getRadioValue(_fieldset) {
  const radios = _fieldset.querySelectorAll("input");

  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return i;
    }
  }

  return -1;
}

export function setInputAttributes(_elem, _type, _nameId, _value) {
  if (_type) _elem.setAttribute("type", _type);

  if (_nameId) {
    _elem.setAttribute("name", _nameId);
    _elem.setAttribute("id", _nameId);
  }

  if (_value) _elem.setAttribute("value", _value);
}

export function createRadioField(_name, _defaultValue, _labelArr) {
  const field = document.createElement("fieldset");
  field.classList.add(`${_name}-fieldset`);

  const radios = [];
  const labels = [];

  for (let i = 0; i < _labelArr.length; i++) {
    radios.push(document.createElement("input"));
    radios[i].setAttribute("type", "radio");
    radios[i].setAttribute("id", `${_name}-${i}`);
    radios[i].setAttribute("name", _name);
    radios[i].setAttribute("value", _labelArr[i]);
    field.appendChild(radios[i]);

    labels.push(document.createElement("label"));
    labels[i].setAttribute("for", `${_name}-${i}`);
    labels[i].textContent = _labelArr[i];
    field.appendChild(labels[i]);
  }

  radios[_defaultValue].setAttribute("checked", "");

  return field;
}

export function createSvg(_path, _title, _classes, _pathClasses) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");

  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = _title;
  svg.appendChild(title);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", _path);
  svg.appendChild(path);

  addClasses(svg, _classes);
  addClasses(path, _pathClasses);

  return svg;
}

export function addClasses(_elem, _classes) {
  if (_classes) {
    // Can pass array of strings or single string.
    if (typeof _classes == "string") {
      _elem.classList.add(_classes);
    } else {
      _elem.classList.add(..._classes);
    }
  }
}

export function nodeListContainsClass(_nodeList, _class) {
  for (const elem of _nodeList) {
    if (elem.classList.contains(_class)) return true;
  }

  return false;
}

export function nodeListContainsElement(_nodeList, _elem) {
  for (const listElem of _nodeList) {
    if (listElem === _elem) return true;
  }

  return false;
}

export function elementContainsElement(_elem1, _elem2) {
  const contents = _elem1.querySelectorAll("*");

  for (const elemToCheck of contents) {
    if (elemToCheck === _elem2) return true;
  }

  return false;
}

export function elementIsOrContainsElement(_elem1, _elem2) {
  if (_elem1 === _elem2) return true;
  return elementContainsElement(_elem1, _elem2);
}
