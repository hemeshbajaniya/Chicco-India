"use strict";

/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
  var $updates = $results.find(selector);
  $(selector).empty().html($updates.html());
}

/**
 * appends params to a url
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} icon - icon that was clicked to add a product to the wishlist
 */
function displayMessageAndChangeIcon(data, icon) {
  $.spinner().stop();
  var status;
  if (data.success) {
    status = "alert-success";
    if (icon.hasClass("fa-heart-o")) {
      icon.removeClass("fa-heart-o").addClass("fa-heart");
    }
  } else {
    status = "alert-danger";
  }

  if ($(".add-to-wishlist-messages").length === 0) {
    $("body").append('<div class="add-to-wishlist-messages "></div>');
  }
  $(".add-to-wishlist-messages").append(
    '<div class="add-to-wishlist-alert text-center ' +
      status +
      '">' +
      data.msg +
      "</div>"
  );

  setTimeout(function () {
    $(".add-to-wishlist-messages").remove();
  }, 5000);
}

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
  $(".product_filter.active").each(function () {
    $(this).removeClass("active");
    var activeDiv = $results.find(
      "." + $(this)[0].className.replace(/ /g, ".")
    );
    activeDiv.addClass("active");
    activeDiv.find("button.title").attr("aria-expanded", "true");
  });

  updateDom($results, ".product_filter");
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
  var $results = $(response);
  var specialHandlers = {
    ".product_filter": handleRefinements,
  };

  // Update DOM elements that do not require special handling
  [
    ".grid-header",
    ".header-bar",
    ".header.page-title",
    ".product-grid",
    ".show-more",
    ".filter-bar",
    ".topbar",
  ].forEach(function (selector) {
    updateDom($results, selector);
  });

  Object.keys(specialHandlers).forEach(function (selector) {
    specialHandlers[selector]($results);
  });
}

/**
 * This function retrieves another page of content to display in the content search grid
 * @param {JQuery} $element - the jquery element that has the click event attached
 * @param {JQuery} $target - the jquery element that will receive the response
 * @return {undefined}
 */
function getContent($element, $target) {
  var showMoreUrl = $element.data("url");
  $.spinner().start();
  $.ajax({
    url: showMoreUrl,
    method: "GET",
    success: function (response) {
      $target.append(response);
      $.spinner().stop();
    },
    error: function () {
      $.spinner().stop();
    },
  });
}

/**
 * Update sort option URLs from Ajax response
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function updateSortOptions(response) {
  var $tempDom = $("<div>").append($(response));
  var sortOptions = $tempDom.find(".grid-footer").data("sort-options").options;
  sortOptions.forEach(function (option) {
    $("option." + option.id).val(option.url);
  });
}

/**
 * Returns a map of query string params with key as param name and val as param value
 *
 * @param {string} url - page URL
 * @return {undefined}
 */
function getUrlParamObj(url) {
  var params = {};
  var paramStr = url.slice(url.indexOf("?") + 1);
  var definitions = paramStr.split("&");

  definitions.forEach(function (val, key) {
    var parts = val.split("=", 2);
    params[parts[0]] = parts[1];
  });

  return params;
}

function replaceQueryParam(param, newval, search) {
  var regex = new RegExp("([?;&])" + param + "[^&;]*[;&]?");
  var query = search.replace(regex, "$1").replace(/&$/, "");

  return (
    (query.length > 2 ? query + "&" : "?") +
    (newval ? param + "=" + newval : "")
  );
}

function updatePageURLForPagination(showMoreUrl) {
  var params = getUrlParamObj(showMoreUrl);
  var start = params.start;
  var size = params.sz;
  var url;

  if (history.pushState) {
    if (document.location.href.indexOf("?") > -1) {
      if (document.location.href.indexOf("start=") > -1) {
        var tempUrlParams = document.location.search;
        tempUrlParams = replaceQueryParam("start", start, tempUrlParams);
        url =
          document.location.href.substring(
            0,
            document.location.href.indexOf("?")
          ) + tempUrlParams;
      } else {
        url = document.location.href + "&start=" + start + "&sz=" + size;
      }
    } else {
      url = document.location.href + "?start=" + start + "&sz=" + size;
    }
    window.history.pushState({ path: url }, "", url);
  }
}

/**
 * Moving the focus to top after pagination and filtering
 */
function moveFocusToTop() {
  var topScrollHeight =
    $(".tab-content").offset().top - $("header").outerHeight();
  $("html, body").animate(
    {
      scrollTop: topScrollHeight,
    },
    500
  );
}

module.exports = {
  filter: function () {
    // Display refinements bar when Menu icon clicked
    $(".container").on("click", "button.filter-results", function () {
      $(".refinement-bar, .modal-background").show();
      $(".refinement-bar").siblings().attr("aria-hidden", true);
      $(".refinement-bar").closest(".row").siblings().attr("aria-hidden", true);
      $(".refinement-bar")
        .closest(".tab-pane.active")
        .siblings()
        .attr("aria-hidden", true);
      $(".refinement-bar")
        .closest(".container.search-results")
        .siblings()
        .attr("aria-hidden", true);
      $(".refinement-bar .close").focus();
    });
  },

  excludeOutOfStock: function () {
    $(document).ready(function () {
      $(".switch .exclude-products").click(function () {
        var url = $(this).data("action");
        if ($(this).prop("checked") == true) {
          url = $(this).data("action");
        } else {
          url = $(this).data("action") + "&showAll=true";
        }
        $.spinner().start();
        $.ajax({
          url: url,
          data: { selectedUrl: url },
          method: "GET",
          success: function (response) {
            $(".product-grid > .row").empty().html(response);
            $.spinner().stop();
          },
          error: function () {
            $.spinner().stop();
          },
        });
      });
    });
  },

  closeRefinements: function () {
    // Refinements close button
    $(".container").on(
      "click",
      ".refinement-bar button.close, .modal-background",
      function () {
        $(".refinement-bar, .modal-background").hide();
        $(".refinement-bar").siblings().attr("aria-hidden", false);
        $(".refinement-bar")
          .closest(".row")
          .siblings()
          .attr("aria-hidden", false);
        $(".refinement-bar")
          .closest(".tab-pane.active")
          .siblings()
          .attr("aria-hidden", false);
        $(".refinement-bar")
          .closest(".container.search-results")
          .siblings()
          .attr("aria-hidden", false);
        $(".btn.filter-results").focus();
      }
    );
  },

  resize: function () {
    // Close refinement bar and hide modal background if user resizes browser
    $(window).resize(function () {
      $(".refinement-bar, .modal-background").hide();
      $(".refinement-bar").siblings().attr("aria-hidden", false);
      $(".refinement-bar")
        .closest(".row")
        .siblings()
        .attr("aria-hidden", false);
      $(".refinement-bar")
        .closest(".tab-pane.active")
        .siblings()
        .attr("aria-hidden", false);
      $(".refinement-bar")
        .closest(".container.search-results")
        .siblings()
        .attr("aria-hidden", false);
    });
  },

  sort: function () {
    // Handle sort order menu selection
    $(".container").on("change", "[name=sort-order]", function (e) {
      e.preventDefault();

      $.spinner().start();
      $(this).trigger("search:sort", this.value);
      $.ajax({
        url: this.value,
        data: { selectedUrl: this.value },
        method: "GET",
        success: function (response) {
          $(".product-grid").empty().html(response);
          $.spinner().stop();
        },
        error: function () {
          $.spinner().stop();
        },
      });
    });
  },

  showMore: function () {
    // Show more products
    $(".container").on("click", ".show-more button", function (e) {
      e.stopPropagation();
      var showMoreUrl = $(this).data("url");
      e.preventDefault();

      $.spinner().start();
      $(this).trigger("search:showMore", e);
      $.ajax({
        url: showMoreUrl,
        data: { selectedUrl: showMoreUrl },
        method: "GET",
        success: function (response) {
          $(".grid-footer").replaceWith(response);
          updateSortOptions(response);
          $.spinner().stop();
        },
        error: function () {
          $.spinner().stop();
        },
      });
    });
  },

  showPagination: function () {
    // Show more products
    $(".container").on("click", ".show-pagination button", function (e) {
      e.stopPropagation();

      var showMoreUrl = $(this).data("url");

      e.preventDefault();

      $.spinner().start();
      $(this).trigger("search:showPagination", e);
      $.ajax({
        url: showMoreUrl,
        data: { selectedUrl: showMoreUrl },
        method: "GET",
        success: function (response) {
          $(".product-grid").html(response);
          updateSortOptions(response);
          var gtmFacetArray = $(response)
            .find(".gtm-product")
            .map(function () {
              return $(this).data("gtm-facets");
            })
            .toArray();
          $("body").trigger("facet:success", [gtmFacetArray]);
          // edit
          updatePageURLForPagination(showMoreUrl);
          // edit
          $.spinner().stop();
          moveFocusToTop();
        },
        error: function () {
          $.spinner().stop();
        },
      });
    });
  },

  applyFilter: function () {
    // Handle refinement value selection and reset click
    $(".container").on(
      "click",
      ".filters-refinments, a.reset-refinements, .refinements li button, .refinement-bar button.reset, .filter-value button, .swatch-filter button",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).checked = true;
        $.spinner().start();
        $(this).trigger("search:filter", e);
        $.ajax({
          url: $(this).data("href"),
          data: {
            page: $(".grid-footer").data("page-number"),
            selectedUrl: $(this).data("href"),
          },
          method: "GET",
          success: function (response) {
            parseResults(response);
            $.spinner().stop();
          },
          error: function () {
            $.spinner().stop();
          },
        });
      }
    );
  },

  showContentTab: function () {
    // Display content results from the search
    $(".container").on("click", ".content-search", function () {
      if ($("#content-search-results").html() === "") {
        getContent($(this), $("#content-search-results"));
      }
    });

    // Display the next page of content results from the search
    $(".container").on("click", ".show-more-content button", function () {
      getContent($(this), $("#content-search-results"));
      $(".show-more-content").remove();
    });
  },

  addToWishlist: function () {
    $("body").on("click", ".wishlistTile", function (e) {
        e.preventDefault();
        e.stopPropagation();
      var icon = $(this).find($("i"));
      var url = $(this).attr("href");
      var pid = $(".home-product").data("pid");

      if (!url || !pid) {
        return;
      }

      $.spinner().start();
      $.ajax({
        url: url,
        type: "post",
        dataType: "json",
        data: {
          pid: pid,
        },
        success: function (data) {
          displayMessageAndChangeIcon(data, icon);
          icon.parent(".heart_icon").addClass("selected");
        },
        error: function (err) {
          displayMessageAndChangeIcon(err, icon);
        },
      });
    });
  },
};
