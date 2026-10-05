// Runs before paint so a saved theme never flashes. Shared by the homepage and the docs.
export const THEME_KEY = "apm-site-theme";
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
