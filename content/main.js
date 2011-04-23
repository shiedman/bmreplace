"use strict";

let prompts = Services.prompt;
let prefs = Services.prefs;

const PREFS_BRANCH = Services.prefs.getBranch("extensions.bmreplace."),
      PREF_TB = "button-position.toolbar",
      PREF_NEXT = "button-position.next-item",
      PREF_KT_TAG = "keep-title-tag",
      BUTTON_ID = "bmreplace-button",
      KEYSET_ID = "bmreplace-keyset";

let main = {
  action: function() {
    let window = Services.wm.getMostRecentWindow("navigator:browser"),
        doc = window.content.document,
        url = doc.location.toString(),
        title = _("label");
    if (!bm.DOMAIN_REGEX.test(url)) {
      prompts.alert(window, title, _("urlNotSupported"));
      return;
    }
    if (bm.isBookmarked(url)) {
      prompts.alert(window, title, _("alreadyBookmarked"));
      return;
    }
    let bookmarks = bm.getRelatedBookmarks(url);
    if (!bookmarks.length) {
      let btn = prompts.confirmEx(window, title, _("relatedNotFound"),
                                  prompts.STD_YES_NO_BUTTONS +
                                  prompts.BUTTON_POS_1_DEFAULT,
                                  "", "", null, null, {});
      if (btn == 0) {
        bm.showAddBookmark(url, doc.title);
      }
      return;
    }
    let titles = [b.title for each (b in bookmarks)],
        selected = {},
        ok = prompts.select(window, title, _("selectBookmark"), titles.length,
                            titles, selected);
    if (ok) {
      let bookmark = bookmarks[selected.value];
      bm.replaceBookmark(bookmark.id, url, doc.title);
    }
  },
  
  /*
   * @return {toolbarId, nextItemId}
   */
  getToolbarPrefs: function() {
    try {
      return {
        toolbarId: PREFS_BRANCH.getCharPref(PREF_TB),
        nextItemId: PREFS_BRANCH.getCharPref(PREF_NEXT)
      };
    } catch(e) {
      return { // default position
        toolbarId: "nav-bar",
        nextItemId: "bookmarks-menu-button-container"
      };
    }
  },
  
  setToolbarPrefs: function(toolbarId, nextItemId) {
    PREFS_BRANCH.setCharPref(PREF_TB, toolbarId || "");
    PREFS_BRANCH.setCharPref(PREF_NEXT, nextItemId || "");
  },
  
  getKeepTitleTag: function() {
    try {
      return PREFS_BRANCH.getCharPref(PREF_KT_TAG);
    } catch(e) {
      return "keep-title";
    }
  }
};

