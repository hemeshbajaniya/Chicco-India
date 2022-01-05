"use strict";
var slick = require("slick-carousel");
var carousel = require("owl.carousel");

/**
 * Retrieves the relevant pid value
 * @param {jquery} $el - DOM container for a given add to cart button
 * @return {string} - value to be used when adding product to cart
 */
function getPidValue($el) {
  var pid;

  if ($("#quickViewModal").hasClass("show") && !$(".product-set").length) {
    pid = $($el)
      .closest(".modal-content")
      .find(".product-quickview")
      .data("pid");
  } else if ($(".product-set-detail").length || $(".product-set").length) {
    pid = $($el).closest(".product-detail").find(".product-id").text();
  } else {
    pid = $(".product-detail:not('.bundle-item')").data("pid");
  }

  return pid;
}

/**
 * Retrieve contextual quantity selector
 * @param {jquery} $el - DOM container for the relevant quantity
 * @return {jquery} - quantity selector DOM container
 */
function getQuantitySelector($el) {
  var quantitySelected;
  if ($el && $(".set-items").length) {
    quantitySelected = $($el)
      .closest(".product-detail")
      .find(".quantity-select");
  } else if ($el && $(".product-bundle").length) {
    var quantitySelectedModal = $($el)
      .closest(".modal-footer")
      .find(".quantity-select");
    var quantitySelectedPDP = $($el)
      .closest(".bundle-footer")
      .find(".quantity-select");
    if (quantitySelectedModal.val() === undefined) {
      quantitySelected = quantitySelectedPDP;
    } else {
      quantitySelected = quantitySelectedModal;
    }
  } else {
    quantitySelected = $(".quantity-select");
  }
  return quantitySelected;
}

/**
 * Retrieves the value associated with the Quantity pull-down menu
 * @param {jquery} $el - DOM container for the relevant quantity
 * @return {string} - value found in the quantity input
 */
function getQuantitySelected($el) {
  return getQuantitySelector($el).val();
}

/**
 * Process the attribute values for an attribute that has image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 * @param {Object} msgs - object containing resource messages
 */
function processSwatchValues(attr, $productContainer, msgs) {
  attr.values.forEach(function (attrValue) {
    var $attrValue = $productContainer.find(
      '[data-attr="' +
        attr.id +
        '"] [data-attr-value="' +
        attrValue.value +
        '"]'
    );
    var $swatchButton = $attrValue.parent();

    if (attrValue.selected) {
      $attrValue.addClass("selected");
      $attrValue.find(".swatch-price-value").addClass("selected");
      $attrValue
        .siblings(".selected-assistive-text")
        .text(msgs.assistiveSelectedText);
    } else {
      $attrValue.removeClass("selected");
      $attrValue.find(".swatch-price-value").removeClass("selected");
      $attrValue.siblings(".selected-assistive-text").empty();
    }

    if (attrValue.url) {
      $swatchButton.attr("data-url", attrValue.url);
    } else {
      $swatchButton.removeAttr("data-url");
    }

    // Disable if not selectable
    $attrValue.removeClass("selectable unselectable");

    $attrValue.addClass(attrValue.selectable ? "selectable" : "unselectable");
  });
}

/**
 * Process attribute values associated with an attribute that does not have image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 */

function ProductCarousel() {
  $(".thumbnails-slider").on("init", function (e, slider) {
    e.preventDefault();
    e.stopImmediatePropagation();
    $(slider.$slides.find(".thumbnail-button")).each(function (index) {
      $(this).on("click", function () {
        // Move aria-current='true' to this button
        $(slider.$slides.find(".thumbnail-button").removeAttr("aria-current"));
        $(this).attr("aria-current", true);

        // Change the main image to match this thumbnail button
        var index = $(this).closest(".slick-slide").data("slick-index");
        $(".main-image-slider").slick("slickGoTo", index);
      });
    });
  });

  // Initialize the slider
  $(".thumbnails-slider").not('.slick-initialized').slick({
    vertical: true,
    slidesToShow: 4,
    infinite: false,
    dots: false,
    arrows: true,
    prevArrow:
      "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-up' aria-hidden='true'></i></button>",
    nextArrow:
      "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-down' aria-hidden='true'></i></button>",
    regionLabel: "thumbnails carousel",
    responsive: [
      {
        breakpoint: 767,
        settings: {
          vertical: false,
          slidesToShow: 4,
        },
      },
    ],
  });

  /* Main image slider */
  $(".main-image-slider").not('.slick-initialized').slick({
    slidesToShow: 1,
    draggable: false,
    dots: false,
    arrows: false,
    regionLabel: "main image carousel",
  });

  // Update the thumbnail slider when the user changes the main slider directly.
  $(".main-image-slider").on(
    "beforeChange",
    function (e, slider, currentSlide, nextSlide) {
      e.preventDefault();
      e.stopImmediatePropagation();
      // Remove aria-current from the last selected thumbnail image button
      $('.thumbnails-slider .thumbnail-button[aria-current="true"]').removeAttr(
        "aria-current"
      );

      // Select the thumbnail image button that goes with this main image. Most importantly, this updates Slick's internal state to be consistent with the visual change.
      $(".thumbnails-slider").slick("slickGoTo", nextSlide);

      // Add aria-current="true" to the correct thumbnail image button to convey to screen readers that it's active.
      $(".thumbnails-slider .thumbnail-button:eq(" + nextSlide + ")").attr(
        "aria-current",
        true
      );
    }
  );

  // Button Thumbnail : Add Clss on click
  $(".product_details .product_imgs .thumbnail-button").click(function (e) {
    e.preventDefault();
    e.stopImmediatePropagation // Modified: stop link # from loading (Why using link then?)
    $(".product_details .product_imgs .thumbnail-button").removeClass(
      "current"
    );
    $(this).addClass("current");
  });
}

function processNonSwatchValues(attr, $productContainer) {
  var $selectedValueContainer = $productContainer.find(
    '[data-selected-variation-attr="' + attr.id + '"]'
  );
  $selectedValueContainer.empty();
  var $attr = '[data-attr="' + attr.id + '"]';
  var $defaultOption = $productContainer.find(
    $attr + " .select-" + attr.id + " option:first"
  );
  $defaultOption.attr("value", attr.resetUrl);

  attr.values.forEach(function (attrValue) {
    var $attrValue = $productContainer.find(
      $attr + ' [data-attr-value="' + attrValue.value + '"]'
    );
    $attrValue.attr("value", attrValue.url).removeAttr("disabled");

    if (!attrValue.selectable) {
      $attrValue.addClass("disabled");
    } else {
      $attrValue.removeClass("disabled");
    }

    if (attrValue.selected) {
      $attrValue.addClass("active");
      $selectedValueContainer.text(attrValue.displayValue);
    } else {
      $attrValue.removeClass("active");
    }

    var polarizationID = "polarization";
    if (
      attr.id.toString().toLowerCase().indexOf(polarizationID) !== -1 &&
      attrValue.selected
    ) {
      var $whyPolarizedPopUp = $(".call-why-polarized-popup");
      if (attrValue.value.toString().toLowerCase() == "yes") {
        $whyPolarizedPopUp.removeClass("d-none");
      } else {
        $whyPolarizedPopUp.addClass("d-none");
      }
    }
  });
}

/**
 * Routes the handling of attribute processing depending on whether the attribute has image
 *     swatches or not
 *
 * @param {Object} attrs - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {jQuery} $productContainer - DOM element for a given product
 * @param {Object} msgs - object containing resource messages
 */
function updateAttrs(attrs, $productContainer, msgs) {
  // Currently, the only attribute type that has image swatches is Color.
  var attrsWithSwatches = ["color"];

  attrs.forEach(function (attr) {
    if (attr.id == 'size' || attr.id == 'gender' || attr.id == 'age') {
      processNonSwatchValues(attr, $productContainer);
    } else {
      processSwatchValues(attr, $productContainer, msgs);
    }
  });
}

/**
 * Updates the availability status in the Product Detail Page
 *
 * @param {Object} response - Ajax response object after an
 *                            attribute value has been [de]selected
 * @param {jQuery} $productContainer - DOM element for a given product
 */
function updateAvailability(response, $productContainer) {
  var availabilityValue = "";
  var availabilityMessages = response.product.availability.messages;
  if (!response.product.readyToOrder) {
    availabilityValue =
      "<li><div>" + response.resources.info_selectforstock + "</div></li>";
  } else {
    availabilityMessages.forEach(function (message) {
      availabilityValue += "<li><div>" + message + "</div></li>";
    });
  }

  $($productContainer).trigger("product:updateAvailability", {
    product: response.product,
    $productContainer: $productContainer,
    message: availabilityValue,
    resources: response.resources,
  });
}

/**
 * Generates html for product attributes section
 *
 * @param {array} attributes - list of attributes
 * @return {string} - Compiled HTML
 */
function getAttributesHtml(attributes) {
  if (!attributes) {
    return "";
  }

  var html = "";

  attributes.forEach(function (attributeGroup) {
    if (attributeGroup.ID === "mainAttributes") {
      attributeGroup.attributes.forEach(function (attribute) {
        html +=
          '<div class="attribute-values">' +
          attribute.label +
          ": " +
          attribute.value +
          "</div>";
      });
    }
  });

  return html;
}

/**
 * @typedef UpdatedOptionValue
 * @type Object
 * @property {string} id - Option value ID for look up
 * @property {string} url - Updated option value selection URL
 */

/**
 * @typedef OptionSelectionResponse
 * @type Object
 * @property {string} priceHtml - Updated price HTML code
 * @property {Object} options - Updated Options
 * @property {string} options.id - Option ID
 * @property {UpdatedOptionValue[]} options.values - Option values
 */

/**
 * Updates DOM using post-option selection Ajax response
 *
 * @param {OptionSelectionResponse} optionsHtml - Ajax response optionsHtml from selecting a product option
 * @param {jQuery} $productContainer - DOM element for current product
 */
function updateOptions(optionsHtml, $productContainer) {
  // Update options
  $productContainer.find(".product-options").empty().html(optionsHtml);
}

/**
 * Parses JSON from Ajax call made whenever an attribute value is [de]selected
 * @param {Object} response - response from Ajax call
 * @param {Object} response.product - Product object
 * @param {string} response.product.id - Product ID
 * @param {Object[]} response.product.variationAttributes - Product attributes
 * @param {Object[]} response.product.images - Product images
 * @param {boolean} response.product.hasRequiredAttrsSelected - Flag as to whether all required
 *     attributes have been selected.  Used partially to
 *     determine whether the Add to Cart button can be enabled
 * @param {jQuery} $productContainer - DOM element for a given product.
 */
function handleVariantResponse($swatchble, response, $productContainer) {
  var isChoiceOfBonusProducts =
    $productContainer.parents(".choose-bonus-product-dialog").length > 0;
  var isVaraint;
  if (response.product.variationAttributes) {
    updateAttrs(
      response.product.variationAttributes,
      $productContainer,
      response.resources
    );
    isVaraint = response.product.productType === "variant";
    if (isChoiceOfBonusProducts && isVaraint) {
      $productContainer
        .parent(".bonus-product-item")
        .data("pid", response.product.id);

      $productContainer
        .parent(".bonus-product-item")
        .data("ready-to-order", response.product.readyToOrder);
    }
  }

  if (response.product.productType == "variant") {
    $("body").trigger("pdpChangedVariation", response.product);
  }

  if (response.product) {
    // Update pricing
    $(".add-to-cart-plp").attr("data-pid", response.product.id);
    $(".buy-now-pdp").attr("data-pid", response.product.id);
    if (!isChoiceOfBonusProducts) {
      var $priceSelector = $(".prices .price", $productContainer).length
        ? $(".prices .price", $productContainer)
        : $(".prices .price");
      if (response.product.price) {
        $priceSelector.replaceWith(response.product.price.html);
      }

      // Update promotions
      $productContainer
        .find(".promotions")
        .empty()
        .html(response.product.promotionsHtml);

      updateAvailability(response, $productContainer);

      if (response.product.available == true) {
        $(".add-to-cart-plp").removeAttr("disabled");
        $(".add-to-cart-plp").text('Add To Cart');
        $(".buy-now-pdp").removeAttr("disabled");
        $(".buy-now-pdp").text('Buy Now');
        $(".backinstock-widget").addClass('d-none');
      } else {
        $(".backinstock-widget").removeClass('d-none');
        $("#backinstock-pid").val(response.product.id);
      }

      if (isChoiceOfBonusProducts) {
        var $selectButton = $productContainer.find(".select-bonus-product");
        $selectButton.trigger("bonusproduct:updateSelectButton", {
          product: response.product,
          $productContainer: $productContainer,
        });
      } else {
        // Enable 'Add to Cart' button if all required attributes have been selected
        $(
          "button.add-to-cart-plp, button.add-to-cart-global, button.update-cart-product-global"
        )
          .trigger("product:updateAddToCart", {
            product: response.product,
            $productContainer: $productContainer,
          })
          .trigger("product:statusUpdate", response.product);
      }

      // Update attributes
      $productContainer
        .find(".main-attributes")
        .empty()
        .html(getAttributesHtml(response.product.attributes));

      var $productNameSelector = $(".product_detail_content .Detailedproduct");
      $productNameSelector.text(response.product.productName);
    }

    $(".thumbnails-slider").slick("unslick");

    // Update primary images
    var primaryImageUrls = response.product.images.large;
    $productContainer
    .find(".product_imgs .main-image-slider").empty();
    $(".main-image-slider").removeClass("slick-initialized slick-slider");

    primaryImageUrls.forEach(function (imageUrl, idx) {
      $productContainer
        .find(".product_imgs .main-image-slider").append(
          `<a data-fancybox="gallery" href="${imageUrl.url}" class="image-link ${idx == 0 ? 'current' : ''}">
          <img src="${imageUrl.url}" alt="${response.product.productName} image number ${idx}"
              itemprop="image" loading="lazy" />
          </a>`
        )
      $productContainer
        .find(".product_imgs .thumbnails-slider .thumbnail-button")
        .find("img")
        .eq(idx)
        .attr("src", imageUrl.url);
    });
   
    ProductCarousel();

  }
}

/**
 * @typespec UpdatedQuantity
 * @type Object
 * @property {boolean} selected - Whether the quantity has been selected
 * @property {string} value - The number of products to purchase
 * @property {string} url - Compiled URL that specifies variation attributes, product ID, options,
 *     etc.
 */

/**
 * Updates the quantity DOM elements post Ajax call
 * @param {UpdatedQuantity[]} quantities -
 * @param {jQuery} $productContainer - DOM container for a given product
 */
function updateQuantities(quantities, $productContainer) {
  if ($productContainer.parent(".bonus-product-item").length <= 0) {
    var optionsHtml = quantities
      .map(function (quantity) {
        var selected = quantity.selected ? " selected " : "";
        return (
          '<option value="' +
          quantity.value +
          '"  data-url="' +
          quantity.url +
          '"' +
          selected +
          ">" +
          quantity.value +
          "</option>"
        );
      })
      .join("");
    getQuantitySelector($productContainer).empty().html(optionsHtml);
  }
}

/**
 * updates the product view when a product attribute is selected or deselected or when
 *         changing quantity
 * @param {string} selectedValueUrl - the Url for the selected variation value
 * @param {jQuery} $productContainer - DOM element for current product
 */
function attributeSelect($swatchble, selectedValueUrl, $productContainer) {
  if (selectedValueUrl) {
    $("body").trigger("product:beforeAttributeSelect", {
      url: selectedValueUrl,
      container: $productContainer,
    });

    $.ajax({
      url: selectedValueUrl,
      method: "GET",
      success: function (data) {
        handleVariantResponse($swatchble, data, $productContainer);
        updateOptions(data.product.optionsHtml, $productContainer);
        updateQuantities(data.product.quantities, $productContainer);
        $("body").trigger("product:afterAttributeSelect", {
          data: data,
          container: $productContainer,
        });
        $.spinner().stop();
      },
      error: function () {
        $.spinner().stop();
      },
    });
  }
}

/**
 * Retrieves url to use when adding a product to the cart
 *
 * @return {string} - The provided URL to use when adding a product to the cart
 */
function getAddToCartUrl() {
  return $(".add-to-cart-url").val();
}

/**
 * Parses the html for a modal window
 * @param {string} html - representing the body and footer of the modal window
 *
 * @return {Object} - Object with properties body and footer.
 */
function parseHtml(html) {
  var $html = $("<div>").append($.parseHTML(html));

  var body = $html.find(".choice-of-bonus-product");
  var footer = $html.find(".modal-footer").children();

  return { body: body, footer: footer };
}

/**
 * Retrieves url to use when adding a product to the cart
 *
 * @param {Object} data - data object used to fill in dynamic portions of the html
 */
function chooseBonusProducts(data) {
  $(".modal-body").spinner().start();

  if ($("#chooseBonusProductModal").length !== 0) {
    $("#chooseBonusProductModal").remove();
  }
  var bonusUrl;
  if (data.bonusChoiceRuleBased) {
    bonusUrl = data.showProductsUrlRuleBased;
  } else {
    bonusUrl = data.showProductsUrlListBased;
  }

  var htmlString =
    "<!-- Modal -->" +
    '<div class="modal fade" id="chooseBonusProductModal" tabindex="-1" role="dialog">' +
    '<span class="enter-message sr-only" ></span>' +
    '<div class="modal-dialog choose-bonus-product-dialog" ' +
    'data-total-qty="' +
    data.maxBonusItems +
    '"' +
    'data-UUID="' +
    data.uuid +
    '"' +
    'data-pliUUID="' +
    data.pliUUID +
    '"' +
    'data-addToCartUrl="' +
    data.addToCartUrl +
    '"' +
    'data-pageStart="0"' +
    'data-pageSize="' +
    data.pageSize +
    '"' +
    'data-moreURL="' +
    data.showProductsUrlRuleBased +
    '"' +
    'data-bonusChoiceRuleBased="' +
    data.bonusChoiceRuleBased +
    '">' +
    "<!-- Modal content-->" +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '    <span class="">' +
    data.labels.selectprods +
    "</span>" +
    '    <button type="button" class="close pull-right" data-dismiss="modal">' +
    '        <span aria-hidden="true">&times;</span>' +
    '        <span class="sr-only"> </span>' +
    "    </button>" +
    "</div>" +
    '<div class="modal-body"></div>' +
    '<div class="modal-footer"></div>' +
    "</div>" +
    "</div>" +
    "</div>";
  $("body").append(htmlString);
  $(".modal-body").spinner().start();

  $.ajax({
    url: bonusUrl,
    method: "GET",
    dataType: "json",
    success: function (response) {
      var parsedHtml = parseHtml(response.renderedTemplate);
      $("#chooseBonusProductModal .modal-body").empty();
      $("#chooseBonusProductModal .enter-message").text(
        response.enterDialogMessage
      );
      $("#chooseBonusProductModal .modal-header .close .sr-only").text(
        response.closeButtonText
      );
      $("#chooseBonusProductModal .modal-body").html(parsedHtml.body);
      $("#chooseBonusProductModal .modal-footer").html(parsedHtml.footer);
      $("#chooseBonusProductModal").modal("show");
      $.spinner().stop();
    },
    error: function () {
      $.spinner().stop();
    },
  });
}

/**
 * Retrieves the bundle product item ID's for the Controller to replace bundle master product
 * items with their selected variants
 *
 * @return {string[]} - List of selected bundle product item ID's
 */
function getChildProducts() {
  var childProducts = [];
  $(".bundle-item").each(function () {
    childProducts.push({
      pid: $(this).find(".product-id").text(),
      quantity: parseInt($(this).find("label.quantity").data("quantity"), 10),
    });
  });

  return childProducts.length ? JSON.stringify(childProducts) : [];
}

/**
 * Retrieve product options
 *
 * @param {jQuery} $productContainer - DOM element for current product
 * @return {string} - Product options and their selected values
 */
function getOptions($productContainer) {
  var options = $productContainer
    .find(".product-option")
    .map(function () {
      var $elOption = $(this).find(".options-select");
      var urlValue = $elOption.val();
      var selectedValueId = $elOption
        .find('option[value="' + urlValue + '"]')
        .data("value-id");
      return {
        optionId: $(this).data("option-id"),
        selectedValueId: selectedValueId,
      };
    })
    .toArray();

  return JSON.stringify(options);
}

/**
 * Makes a call to the server to report the event of adding an item to the cart
 *
 * @param {string | boolean} url - a string representing the end point to hit so that the event can be recorded, or false
 */
function miniCartReportingUrl(url) {
  if (url) {
    $.ajax({
      url: url,
      method: "GET",
      success: function () {
        // reporting urls hit on the server
      },
      error: function () {
        // no reporting urls hit on the server
      },
    });
  }
}

module.exports = {
  attributeSelect: attributeSelect,
  methods: {
    editBonusProducts: function (data) {
      chooseBonusProducts(data);
    },
  },

  focusChooseBonusProductModal: function () {
    $("body").on("shown.bs.modal", "#chooseBonusProductModal", function () {
      $("#chooseBonusProductModal").siblings().attr("aria-hidden", "true");
      $("#chooseBonusProductModal .close").focus();
    });
  },

  onClosingChooseBonusProductModal: function () {
    $("body").on("hidden.bs.modal", "#chooseBonusProductModal", function () {
      $("#chooseBonusProductModal").siblings().attr("aria-hidden", "false");
    });
  },

  colorAttribute: function () {
    $(document).on("click", '.color-attribute', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if ($(this).attr("disabled")) {
        return;
      }
      var $swatchble = $(this).data("swatchable");
      var $productContainer = $(this).closest(".set-item");
      if (!$productContainer.length) {
        $productContainer = $(this).closest(".product-detail");
      }

      attributeSelect($swatchble, $(this).attr("data-url"), $productContainer);
    });
  },

  selectAttribute: function selectAttribute() {
    var selector = ".select-variation-product";
    $(document).off("change", selector);
    $(document)
      .off("click", selector)
      .on("click", selector, function (e) {
        e.preventDefault();
        if ($(this).attr("disabled") || $(this).hasClass("active")) {
          return;
        }

        var value = $(e.currentTarget).is('input[type="radio"]')
          ? $(e.currentTarget).data("value-url")
          : e.currentTarget.value;

        var $productContainer = $(this).closest(".set-item");
        if (!$productContainer.length) {
          $productContainer = $(this).closest(".product-detail");
        }
        var $swatchble = $(this).data("swatchable");
        attributeSelect($swatchble, value, $productContainer);
      });
  },

  availability: function () {
    $(document).on("change", ".quantity-select", function (e) {
      e.preventDefault();

      var $productContainer = $(this).closest(".product-detail");
      if (!$productContainer.length) {
        $productContainer = $(this)
          .closest(".modal-content")
          .find(".product-quickview");
      }

      if ($(".bundle-items", $productContainer).length === 0) {
        attributeSelect(
          $swatchble,
          $(e.currentTarget).find("option:selected").data("url"),
          $productContainer
        );
      }
    });
  },

  selectBonusProduct: function () {
    $(document).on("click", ".select-bonus-product", function () {
      var $choiceOfBonusProduct = $(this).parents(".choice-of-bonus-product");
      var pid = $(this).data("pid");
      var maxPids = $(".choose-bonus-product-dialog").data("total-qty");
      var submittedQty = parseInt(
        $choiceOfBonusProduct.find(".bonus-quantity-select").val(),
        10
      );
      var totalQty = 0;
      $.each(
        $("#chooseBonusProductModal .selected-bonus-products .selected-pid"),
        function () {
          totalQty += $(this).data("qty");
        }
      );
      totalQty += submittedQty;
      var optionID = $choiceOfBonusProduct
        .find(".product-option")
        .data("option-id");
      var valueId = $choiceOfBonusProduct
        .find(".options-select option:selected")
        .data("valueId");
      if (totalQty <= maxPids) {
        var selectedBonusProductHtml =
          "" +
          '<div class="selected-pid row" ' +
          'data-pid="' +
          pid +
          '"' +
          'data-qty="' +
          submittedQty +
          '"' +
          'data-optionID="' +
          (optionID || "") +
          '"' +
          'data-option-selected-value="' +
          (valueId || "") +
          '"' +
          ">" +
          '<div class="col-sm-11 col-9 bonus-product-name" >' +
          $choiceOfBonusProduct.find(".product-name").html() +
          "</div>" +
          '<div class="col-1"><i class="fa fa-times" aria-hidden="true"></i></div>' +
          "</div>";
        $("#chooseBonusProductModal .selected-bonus-products").append(
          selectedBonusProductHtml
        );
        $(".pre-cart-products").html(totalQty);
        $(".selected-bonus-products .bonus-summary").removeClass(
          "alert-danger"
        );
      } else {
        $(".selected-bonus-products .bonus-summary").addClass("alert-danger");
      }
    });
  },
  removeBonusProduct: function () {
    $(document).on("click", ".selected-pid", function () {
      $(this).remove();
      var $selected = $(
        "#chooseBonusProductModal .selected-bonus-products .selected-pid"
      );
      var count = 0;
      if ($selected.length) {
        $selected.each(function () {
          count += parseInt($(this).data("qty"), 10);
        });
      }

      $(".pre-cart-products").html(count);
      $(".selected-bonus-products .bonus-summary").removeClass("alert-danger");
    });
  },
  enableBonusProductSelection: function () {
    $("body").on("bonusproduct:updateSelectButton", function (e, response) {
      $("button.select-bonus-product", response.$productContainer).attr(
        "disabled",
        !response.product.readyToOrder || !response.product.available
      );
      var pid = response.product.id;
      $("button.select-bonus-product", response.$productContainer).data(
        "pid",
        pid
      );
    });
  },
  showMoreBonusProducts: function () {
    $(document).on("click", ".show-more-bonus-products", function () {
      var url = $(this).data("url");
      $(".modal-content").spinner().start();
      $.ajax({
        url: url,
        method: "GET",
        success: function (html) {
          var parsedHtml = parseHtml(html);
          $(".modal-body").append(parsedHtml.body);
          $(".show-more-bonus-products:first").remove();
          $(".modal-content").spinner().stop();
        },
        error: function () {
          $(".modal-content").spinner().stop();
        },
      });
    });
  },
  addBonusProductsToCart: function () {
    $(document).on("click", ".add-bonus-products", function () {
      var $readyToOrderBonusProducts = $(
        ".choose-bonus-product-dialog .selected-pid"
      );
      var queryString = "?pids=";
      var url = $(".choose-bonus-product-dialog").data("addtocarturl");
      var pidsObject = {
        bonusProducts: [],
      };

      $.each($readyToOrderBonusProducts, function () {
        var qtyOption = parseInt($(this).data("qty"), 10);

        var option = null;
        if (qtyOption > 0) {
          if (
            $(this).data("optionid") &&
            $(this).data("option-selected-value")
          ) {
            option = {};
            option.optionId = $(this).data("optionid");
            option.productId = $(this).data("pid");
            option.selectedValueId = $(this).data("option-selected-value");
          }
          pidsObject.bonusProducts.push({
            pid: $(this).data("pid"),
            qty: qtyOption,
            options: [option],
          });
          pidsObject.totalQty = parseInt($(".pre-cart-products").html(), 10);
        }
      });
      queryString += JSON.stringify(pidsObject);
      queryString =
        queryString + "&uuid=" + $(".choose-bonus-product-dialog").data("uuid");
      queryString =
        queryString +
        "&pliuuid=" +
        $(".choose-bonus-product-dialog").data("pliuuid");
      $.spinner().start();
      $.ajax({
        url: url + queryString,
        method: "POST",
        success: function (data) {
          $.spinner().stop();
          if (data.error) {
            $("#chooseBonusProductModal").modal("hide");
            if ($(".add-to-cart-messages").length === 0) {
              $("body").append("<div class='add-to-cart-messages'></div>");
            }
            $(".add-to-cart-messages").append(
              '<div class="alert alert-danger add-to-basket-alert text-center"' +
                ' role="alert">' +
                data.errorMessage +
                "</div>"
            );
            setTimeout(function () {
              $(".add-to-basket-alert").remove();
            }, 3000);
          } else {
            $(".configure-bonus-product-attributes").html(data);
            $(".bonus-products-step2").removeClass("hidden-xl-down");
            $("#chooseBonusProductModal").modal("hide");

            if ($(".add-to-cart-messages").length === 0) {
              $("body").append('<div class="add-to-cart-messages"></div>');
            }
            $(".minicart-quantity").html(data.totalQty);
            $(".add-to-cart-messages").append(
              '<div class="alert alert-success add-to-basket-alert text-center"' +
                ' role="alert">' +
                data.msgSuccess +
                "</div>"
            );
            setTimeout(function () {
              $(".add-to-basket-alert").remove();
              if ($(".cart-page").length) {
                location.reload();
              }
            }, 1500);
          }
        },
        error: function () {
          $.spinner().stop();
        },
      });
    });
  },

  buyNow: function () {
    $(document).on('click', 'button.buy-now-pdp', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var addToCartUrl;
      var pid;
      $.spinner().start();
      $('body').trigger('product:beforeAddToCart', this);
      pid = $(this).data('pid');
      addToCartUrl = getAddToCartUrl();
      var $quantity = $(this).data('quantity');
    
      if ($quantity == undefined) {
        $quantity = $('.pdp-quantity').val();
      }
    
      var form = {
        pid: pid,
        pidsObj: '',
        childProducts: '',
        quantity: $quantity,
        buyNow: true
      };
      $(this).trigger('updateAddToCartFormData', form);
    
      if (addToCartUrl) {
        $.ajax({
          url: addToCartUrl,
          method: 'POST',
          data: form,
          success: function success(data) {
            $('.minicart-quantity').empty().text(data.quantityTotal);
            $('body').trigger('product:afterAddToCart', data);
            
            if (data.redirectCart) {
               window.location.href = data.redirectCart;
            }

            $.spinner().stop();
          },
          error: function error() {
            $.spinner().stop();
          }
        });
      }
    });
  },

  getPidValue: getPidValue,
  getQuantitySelected: getQuantitySelected,
  miniCartReportingUrl: miniCartReportingUrl,
};
