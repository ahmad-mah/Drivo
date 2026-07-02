export default {
  postcssPlugin: "logical-to-physical",
  Declaration(decl) {
    switch (decl.prop) {
      case "padding-inline":
        decl.cloneBefore({ prop: "padding-left", value: decl.value });
        decl.cloneBefore({ prop: "padding-right", value: decl.value });
        decl.remove();
        break;
      case "padding-block":
        decl.cloneBefore({ prop: "padding-top", value: decl.value });
        decl.cloneBefore({ prop: "padding-bottom", value: decl.value });
        decl.remove();
        break;
      case "margin-inline":
        decl.cloneBefore({ prop: "margin-left", value: decl.value });
        decl.cloneBefore({ prop: "margin-right", value: decl.value });
        decl.remove();
        break;
      case "margin-block":
        decl.cloneBefore({ prop: "margin-top", value: decl.value });
        decl.cloneBefore({ prop: "margin-bottom", value: decl.value });
        decl.remove();
        break;
      case "padding-inline-start":
        decl.cloneBefore({ prop: "padding-left", value: decl.value });
        decl.remove();
        break;
      case "padding-inline-end":
        decl.cloneBefore({ prop: "padding-right", value: decl.value });
        decl.remove();
        break;
      case "margin-inline-start":
        decl.cloneBefore({ prop: "margin-left", value: decl.value });
        decl.remove();
        break;
      case "margin-inline-end":
        decl.cloneBefore({ prop: "margin-right", value: decl.value });
        decl.remove();
        break;
    }
  },
};
