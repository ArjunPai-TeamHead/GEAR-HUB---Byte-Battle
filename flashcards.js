document.getElementById("addCardBtn").addEventListener("click", () => {
    const frontText = document.getElementById("frontInput").value.trim();
    const backText = document.getElementById("backInput").value.trim();

    if (!frontText || !backText) return;

    const grid = document.getElementById("flashcardGrid");

    const card = document.createElement("div");
    card.className = "flashcard";

    card.innerHTML = `
        <button class="delete-btn">×</button>
        <div class="flashcard-inner">
            <div class="flashcard-front">${frontText}</div>
            <div class="flashcard-back">${backText}</div>
        </div>
    `;

    // Delete button behavior
    card.querySelector(".delete-btn").addEventListener("click", (event) => {
        event.stopPropagation(); // stops flipping when deleting
        card.remove();
    });

    // Flip card on click
    card.addEventListener("click", () => {
        card.classList.toggle("flip");
    });

    grid.appendChild(card);

    document.getElementById("frontInput").value = "";
    document.getElementById("backInput").value = "";
});
