let allExtensions = [];

async function loadShopItems() {
  try {
    const response = await fetch("./data.json");
    allExtensions = await response.json();
    renderCards(allExtensions);
  } catch (error) {
    const container = document.querySelector(".cards");
    container.innerHTML = "<p>Falha ao carregar dados</p>";
    announcer.textContent = "Falha ao carregar dados";
    console.error("Erro ao carregar extensões:", error);
  }
}

function loadCartEmpty() {
  const container = document.querySelector(".cart");
  const template = document.querySelector("#cart__template_empty");
  container.innerHTML = "";
  container.appendChild(template.content.cloneNode(true));
}

let cart = [];

function renderCart() {
  const container = document.querySelector(".cart");
  container.innerHTML = "";

  if (cart.length === 0) {
    const template = document.querySelector("#cart__template_empty");
    container.appendChild(template.content.cloneNode(true));
    return;
  }

  const template = document.querySelector("#cart__template_full");
  const clone = template.content.cloneNode(true);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  clone.querySelector(".cart__title_number").textContent = `(${totalQuantity})`;

  const productsContainer = clone.querySelector(".cart__products");
  cart.forEach((item) => {
    const template = document.querySelector("#cart__template_item");
    const clone = template.content.cloneNode(true);

    clone.querySelector(".cart__product_name").textContent = item.name;
    clone.querySelector(".cart__product_quantity").textContent =
      `${item.quantity}x`;
    clone.querySelector(".cart__product_price").textContent =
      "@ $" + parseInt(item.price).toFixed(2);
    clone.querySelector(".cart__product_total").textContent =
      "$" + (item.price * item.quantity).toFixed(2);

    clone.querySelector(".cart__remove").addEventListener("click", () => {
      const itemFound = cart.find((i) => i.name === item.name);
      cart.splice(cart.indexOf(itemFound), 1);

      const counterDiv = document.querySelector(
        `.card__counter[data-name="${item.name}"]`,
      );

      if (counterDiv) {
        // 2. Cria um NOVO botão "Add to Cart" do seu template
        const cardTemplate = document.querySelector("#card_template");
        const tempDiv = document.createElement("div");
        tempDiv.appendChild(cardTemplate.content.cloneNode(true));

        const cardContainer = document.querySelector(
          `.card:has([data-name="${item.name}"])`,
        );
        const realImage = cardContainer.querySelector(".card__product_image");

        const newWhiteButton = tempDiv.querySelector(".card__button_cart");
        newWhiteButton.dataset.name = item.name;

        // Passe a imagem real da lista, não a do template
        setupAddToCartButton(newWhiteButton, item, realImage);
        counterDiv.replaceWith(newWhiteButton);

        realImage.classList.remove("card__product_image--selected");
      }

      const announcer = document.getElementById("announcer");
      announcer.textContent = `${itemFound.name} removed from cart.`;
      renderCart();
    });

    productsContainer.appendChild(clone);
  });

  clone.querySelector(".cart__button_confirm").addEventListener("click", () => {
    renderModal();
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  clone.querySelector(".cart__total_value").textContent =
    `$${total.toFixed(2)}`;
  container.appendChild(clone);
}

function setupAddToCartButton(button, ext, image) {
  const addToCartAction = () => {
    const announcer = document.getElementById("announcer");
    announcer.textContent = `${ext.name} has been added to your cart.`;
    image.classList.add("card__product_image--selected");

    const buttonTemplate = document.querySelector("#card__template_counter");
    const newButton = buttonTemplate.content.cloneNode(true);

    const counterDiv = newButton.querySelector(".card__counter");
    counterDiv.dataset.name = ext.name;

    const quantity = newButton.querySelector(".card__counter_quantity");
    const buttonPlus = newButton.querySelector(".card_counter_plus");
    const buttonMinus = newButton.querySelector(".card_counter_minus");
    const thumbnailPath = ext.image.thumbnail ? ext.image.thumbnail : ext.image;
    quantity.textContent = 1;
    cart.push({
      name: ext.name,
      price: ext.price,
      quantity: 1,
      image: thumbnailPath,
    });
    renderCart();

    buttonPlus.addEventListener("click", () => {
      const item = cart.find((i) => i.name === ext.name);
      item.quantity += 1;
      quantity.textContent = item.quantity;
      const announcer = document.getElementById("announcer");
      announcer.textContent = `${ext.name} quantity on cart is now ${item.quantity}.`;
      renderCart();
    });

    buttonMinus.addEventListener("click", () => {
      const item = cart.find((i) => i.name === ext.name);

      if (item.quantity === 1) {
        cart.splice(cart.indexOf(item), 1);
        counterDiv.replaceWith(button);
        image.classList.remove("card__product_image--selected");
        const announcer = document.getElementById("announcer");
        announcer.textContent = `${ext.name} removed from cart.`;
        renderCart();
      } else {
        item.quantity -= 1;
        quantity.textContent = item.quantity;
        const announcer = document.getElementById("announcer");
        announcer.textContent = `${ext.name} quantity on cart is now ${item.quantity}.`;
        renderCart();
      }
    });

    button.replaceWith(newButton);
  };

  button.addEventListener("click", addToCartAction);
}

function renderCards(extensions) {
  const container = document.querySelector(".cards");
  const template = document.querySelector("#card_template");
  container.innerHTML = "";

  extensions.forEach((ext) => {
    const card = template.content.cloneNode(true);
    const cardDiv = card.querySelector(".card");

    cardDiv.querySelector(".card__product_image").src = ext.image.desktop;
    cardDiv.querySelector(".card__name").textContent = ext.category;
    cardDiv.querySelector(".card__title").textContent = ext.name;
    cardDiv.querySelector(".card__price").textContent =
      "$" + ext.price.toFixed(2);

    const image = cardDiv.querySelector(".card__product_image");
    const button = cardDiv.querySelector(".card__button_cart");

    button.dataset.name = ext.name;
    button.dataset.price = ext.price;

    button.addEventListener("click", () => {
      setupAddToCartButton(button, ext, image);
      button.click();
    });

    button.addEventListener("focus", () => {
      image.classList.add("card__product_image--focused");
    });

    button.addEventListener("blur", () => {
      image.classList.remove("card__product_image--focused");
    });

    container.appendChild(card);
  });
}

function renderModal() {
  const overlay = document.querySelector(".modal__overlay");
  const modalContainer = document.querySelector(".modal");
  modalContainer.innerHTML = "";

  // mostra o overlay
  overlay.classList.remove("hidden");
  overlay.classList.add("active");

  // injeta o template de confirmação
  const modalTemplate = document.querySelector("#cart__template_confirmation");
  const modal = modalTemplate.content.cloneNode(true);

  // preenche os itens
  const productsContainer = modal.querySelector(".cart__confirmation_products");
  cart.forEach((item) => {
    const templateItems = document.querySelector(
      "#cart__template_confirmation_items",
    );
    const clone = templateItems.content.cloneNode(true);

    clone.querySelector(".cart__confirmation_product_image").src = item.image;
    clone.querySelector(".cart__confirmation_product_name").textContent =
      item.name;
    clone.querySelector(".cart__confirmation_product_quantity").textContent =
      `${item.quantity}x`;
    clone.querySelector(".cart__confirmation_product_price").textContent =
      "@ $" + item.price.toFixed(2);
    clone.querySelector(".cart__product_confirmation_total").textContent =
      "$" + (item.price * item.quantity).toFixed(2);

    productsContainer.appendChild(clone);
  });
  overlay.classList.add("active");

  const confirmBtn = modal.querySelector(".cart__confirmation_button");

  confirmBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
    overlay.classList.remove("active");
    loadCartEmpty();
    modalContainer.innerHTML = "";
    loadShopItems();
    cart = [];
  });

  // preenche o total
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  modal.querySelector(".cart__confirmation_order_value").textContent =
    `$${total.toFixed(2)}`;

  modalContainer.appendChild(modal);
}

loadShopItems();
loadCartEmpty();
