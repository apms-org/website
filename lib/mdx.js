import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { bundledLanguages } from "shiki";
import { components } from "../components/docs/mdx.jsx";

const ALIAS = { console: "shellsession", shell: "sh", zsh: "sh", ps: "powershell", text: "plaintext", txt: "plaintext", output: "plaintext", env: "dotenv" };

const pretty = {
  theme: { light: "github-light", dark: "github-dark-dimmed" },
  keepBackground: false,
  defaultLang: { block: "plaintext" }
};

// A fence in a language Shiki doesn't ship renders as plain text instead of failing the page.
function langFix() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === "code" && node.lang) {
        const l = ALIAS[node.lang] || node.lang;
        node.lang = l === "plaintext" || bundledLanguages[l] ? l : "plaintext";
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export async function renderMDX(source) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, langFix],
        rehypePlugins: [rehypeSlug, [rehypePrettyCode, pretty]]
      }
    }
  });
  return content;
}
