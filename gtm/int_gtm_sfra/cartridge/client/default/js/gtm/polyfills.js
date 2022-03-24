if (!("nextElementSibling" in document.documentElement)) {
    Object.defineProperty(Element.prototype, "nextElementSibling", {
        get: function () {
            var e = this.nextSibling;
            while (e && e.nodeType !== 1) {
                e = e.nextSibling;
            }
            return e;
        }
    });
}
