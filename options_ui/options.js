var blockedSites = document.getElementById('blocked-sites'),
  blockedUrl = [],
  save = document.getElementById('save'),
  addBtn = document.getElementById('add');

save.onclick = saveBlockedUrls;

window.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['blocked', 'enabled'], function(local) {
    var { blocked, enabled } = local;
    if (Array.isArray(blocked)) {
      blocked.forEach(function(url) {
        blockedSites.insertBefore(blockedSite(url), addBtn);
      });
    }
    addButton(addBtn);
    blockedUrl = blocked;
  });
});

function blockedSite(url) {
  var newBlockedSite = createElement('div', 'flex-center flex-row sub-box')
  newBlockedSite.style.width = '95%';
  newBlockedSite.style.margin = '5%';
  newBlockedSite.appendChild(createElement('div', 'flex-center flex-grow', url));

  var removeBlockedSite = createElement('img', 'btn margin-right', '');
  removeBlockedSite.src = '../img/trash.svg';
  removeBlockedSite.title = 'remove';
  removeBlockedSite.style.margin = 'auto';
  removeBlockedSite.onclick = function() {
    newBlockedSite.remove()
    saveBlockedUrls();
  };

  newBlockedSite.appendChild(removeBlockedSite);

  return newBlockedSite;
}

function addButton(btn) {
  btn.innerHTML = '>Add New';
  btn.className = 'flex-center btn';
  btn.style.width = '95%';
  btn.style.margin = '5%';
  btn.onclick = function() {
    modal(function(newBlockedUrl) {
      if (newBlockedUrl && newBlockedUrl.replaceAll(' ', '')) {
        blockedSites.insertBefore(blockedSite(newBlockedUrl), btn);
      }
    })
  };
  return btn;
}

function saveBlockedUrls() {
  blockedUrl = [];
  blockedSites.childNodes.forEach(function(site) {
    if (site.childNodes.length == 0) {
      return;
    }
    var url = site.childNodes[0].innerHTML;
    if (url != undefined && url != '&gt;Add New') {
      blockedUrl.push(url);
    }
  });
  chrome.storage.local.set({ blocked: blockedUrl });
}

var modalContainer = null;

function modal(responde) {
  modalContainer = createElement('div', 'modal-container');
  document.body.appendChild(modalContainer)
  var content = createElement('div', 'box modal-content');
  modalContainer.appendChild(content);
  var title = createElement('p', 'modal-title', 'Type the URL that you want to block:');
  content.appendChild(title);
  var url = createElement('input', 'sub-box modal-field');
  content.appendChild(url);
  var buttonGroup = createElement('div', 'flex-center flex-row flex-gap');
  content.appendChild(buttonGroup);
  var confirm = createElement('div', 'btn flex-center modal-btn', 'confirm');
  buttonGroup.appendChild(confirm);
  var cancel = createElement('div', 'btn flex-center modal-btn', 'cancel');
  buttonGroup.appendChild(cancel);

  confirm.onclick = function() {
    responde(url.value);
    closeModal();
  };
  cancel.onclick = function() {
    responde(null);
    closeModal();
  };
}

function closeModal() {
  modalContainer.remove();
}

function createElement(tag, className, innerHTML) {
  var newElement = document.createElement(tag);
  newElement.className = className;
  newElement.innerHTML = innerHTML || '';
  return newElement;
}