class Storage {
  static getData() {
    return JSON.parse(localStorage.getItem("LIB_STORE") || "{}") || { books: [], members: [] };
  }

  static saveData(data) {
    localStorage.setItem("LIB_STORE", JSON.stringify(data));
  }
}

class Books {
  constructor() {
    this.items = [];
  }

  add(id, title, author) {
    if (!id || !title) return;
    this.items.push({ id, title, author, available: true });
  }

  search(text) {
    const t = text.toLowerCase();
    return this.items.filter(b =>
      b.title.toLowerCase().includes(t) ||
      b.author.toLowerCase().includes(t)
    );
  }

  get(id) {
    return this.items.find(b => b.id === id);
  }
}

class Members {
  constructor() {
    this.list = [];
  }

  register(id, name, email) {
    if (!id || !name) return;
    this.list.push({ id, name, email, fees: 0 });
  }

  find(id) {
    return this.list.find(m => m.id === id);
  }
}

class Fees {
  static calculate(days) {
    const limit = 14;
    return days > limit ? (days - limit) * 0.5 : 0;
  }
}

class Display {
  static showBooks(list) {
    const box = document.querySelector('#bookPanel');
    box.innerHTML = `<h2>Books</h2>` +
      list.map(b => `<p><strong class="${b.available ? "available" : "taken"}">
      ${b.available ? "✔" : "✗"}</strong> ${b.id}: ${b.title} — ${b.author}</p>`).join("");
  }

  static showMember(m) {
    const box = document.querySelector('#memberPanel');
    if (!m) {
      box.innerHTML = "<em>No member selected.</em>";
      return;
    }
    box.innerHTML = `<h2>${m.name}</h2><p>${m.email}</p><p>Fees: $${m.fees}</p>`;
  }
}

class LibraryApp {
  constructor() {
    this.books = new Books();
    this.members = new Members();
    this.load();
  }

  load() {
    const data = Storage.getData();
    this.books.items = data.books || [];
    this.members.list = data.members || [];
    Display.showBooks(this.books.items);
  }

  save() {
    Storage.saveData({
      books: this.books.items,
      members: this.members.list
    });
  }

  checkout(bookId, memberId) {
    const book = this.books.get(bookId);
    const member = this.members.find(memberId);
    if (!book || !book.available || !member) return;

    book.available = false;
    member.fees += Fees.calculate(21);

    this.save();
    Display.showBooks(this.books.items);
    Display.showMember(member);
  }
}

// === Startup ===
const app = new LibraryApp();

function $(s) { return document.querySelector(s); }

$('#addBook').onclick = () => {
  app.books.add($('#bookId').value, $('#bookTitle').value, $('#bookAuthor').value);
  app.save();
  Display.showBooks(app.books.items);
};

$('#addMember').onclick = () => {
  app.members.register($('#memberId').value, $('#memberName').value, $('#memberEmail').value);
  app.save();
};

$('#searchBox').oninput = e => {
  Display.showBooks(app.books.search(e.target.value));
};

$('#checkoutBtn').onclick = () => {
  app.checkout($('#coBook').value, $('#coMember').value);
};

$('#loadDemo').onclick = () => {
  if (app.books.items.length === 0) {
    app.books.add("A1", "Refactoring", "Martin Fowler");
    app.books.add("A2", "The Pragmatic Programmer", "Hunt & Thomas");
  }

  if (app.members.list.length === 0) {
    app.members.register("M1", "Grace Hopper", "grace@navy.mil");
    app.members.register("M2", "Alan Turing", "alan@bletchley.uk");
  }

  app.save();
  Display.showBooks(app.books.items);
};

$('#clearAll').onclick = () => {
  localStorage.removeItem("LIB_STORE");
  location.reload();
};
