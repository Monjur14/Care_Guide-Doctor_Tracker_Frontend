/**
 * The collapsed sidebar is CSS-driven via <html data-sidebar="collapsed">, set
 * before first paint by an inline script, so there's no expand→collapse flash.
 */
export const SIDEBAR_STORAGE_KEY = "dt:sidebar";

export const sidebarInitScript = `try{if(localStorage.getItem("${SIDEBAR_STORAGE_KEY}")==="collapsed")document.documentElement.dataset.sidebar="collapsed"}catch(e){}`;

export function toggleSidebar() {
  const root = document.documentElement;
  const collapsed = root.dataset.sidebar !== "collapsed";
  if (collapsed) root.dataset.sidebar = "collapsed";
  else delete root.dataset.sidebar;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? "collapsed" : "expanded");
  } catch {
    /* storage unavailable: state just won't persist */
  }
}
