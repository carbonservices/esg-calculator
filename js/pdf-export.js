(function (root) {
    function rememberStyle(element) {
        return { element, style: element.getAttribute('style') };
    }

    function restoreStyle(snapshot) {
        if (snapshot.style === null) snapshot.element.removeAttribute('style');
        else snapshot.element.setAttribute('style', snapshot.style);
    }

    function prepare(element, options = {}) {
        const width = options.width || '1200px';
        const styled = element.querySelectorAll('[data-pdf-expand], [data-pdf-only], [data-pdf-chart], [data-pdf-compact] th, [data-pdf-compact] td');
        const snapshots = [element, ...styled].map(rememberStyle);
        element.style.width = width;
        element.style.maxWidth = width;
        element.style.padding = '20px';
        element.style.background = '#ffffff';
        element.querySelectorAll('[data-pdf-expand]').forEach(node => {
            node.style.maxHeight = 'none';
            node.style.overflow = 'visible';
        });
        element.querySelectorAll('[data-pdf-only]').forEach(node => { node.style.display = 'block'; });
        element.querySelectorAll('[data-pdf-chart]').forEach(node => { node.style.height = options.chartHeight || '220px'; });
        element.querySelectorAll('[data-pdf-compact] th, [data-pdf-compact] td').forEach(node => {
            node.style.padding = '4px 8px';
            node.style.lineHeight = '1.15';
        });
        return { restore: () => snapshots.forEach(restoreStyle) };
    }

    root.PDFExport = { prepare };
}(typeof globalThis !== 'undefined' ? globalThis : this));
