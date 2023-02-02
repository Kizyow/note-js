function Note(titre, contenu){
    this.titre = titre;
    this.contenu = contenu;
    this.date_creation = new Date();
}

Note.prototype.setTitre = function(titre){
    this.titre = titre;
}

Note.prototype.setContenu = function(contenu){
    this.contenu = contenu;
}

function NoteView(note){
    this.note = note;
}

NoteView.prototype.toHtml = function(){
    let conv = new showdown.Converter();
    let titreMarkdown = conv.makeHtml(`# ${this.note.titre}`);
    let contenuMarkdown = conv.makeHtml(this.note.contenu);
    return `${titreMarkdown} ${contenuMarkdown}`;
}

NoteView.prototype.afficherNoteCourante = function(){
    let currentNoteView = document.getElementById("currentNoteView");
    currentNoteView.innerHTML = this.toHtml();
}

let noteFormView = {
    display(){
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.remove("create_edit_note-hidden");
    },
    hide(){
        let noteForm = document.getElementById("noteForm");
        noteForm.classList.add("create_edit_note-hidden");
    },
    validate(event){
        noteFormView.hide();
        let formTitreValue = document.getElementById("form_add_note_title").value;
        let formContenuValue = document.getElementById("form_add_note_text").value;
        let note = new Note(formTitreValue, formContenuValue);
        let noteView = new NoteView(note);
        noteView.afficherNoteCourante();
    }

};

let mainMenuView = {
    addHandler(){
        noteFormView.display();
    },
    init(){
        let add = document.getElementById("add");
        add.addEventListener('click', this.addHandler)
        let validate = document.getElementById("form_add_note_valid");
        validate.addEventListener('click', noteFormView.validate);
    }
};

let app = {
    noteCourante : undefined,
    init(){
        mainMenuView.init();
    }
};

window.addEventListener('DOMContentLoaded', app.init);