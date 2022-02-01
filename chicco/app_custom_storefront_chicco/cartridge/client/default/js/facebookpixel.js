!function(f,b,e,v,n,t,s)
    {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    } 
(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1847974298691807');
fbq('track', 'PageView');
if($("#viewContentName").val() != null){
    fbq('track', 'ViewContent', {
        content_name: $("#viewContentName").val(),
        content_category: $("#viewContentCategory").val(),
        content_ids: [$("#viewContentIds").val()],
        content_type: $("#viewContentType").val(),
        value: $("#viewContentValue").val(),
        currency: $("#viewContentCurrency").val(),
    });
}
if($("#purchaseValue").val() != null){
    fbq('track', 'Purchase', {
        value: $("#purchaseValue").val(),
        currency: "INR"
    });
}