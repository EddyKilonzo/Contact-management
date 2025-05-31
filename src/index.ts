type Contact = {
    id: number;
    name: string;
    email: string;
    phone: string;
}

class ContactManager {
    contacts: Contact[] = [];

    constructor() {
        this.loadContacts();
    }

    getContacts(): void {
        const contacts = localStorage.getItem('contacts');

        if (contacts) {
            this.contacts = JSON.parse(contacts);
        }
    }

    saveContacts(): void {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    loadContacts(): void {
        const storedContacts = localStorage.getItem('contacts');

        if (storedContacts) {
            this.contacts = JSON.parse(storedContacts);

        
        } else {
            console.log('No contacts found.');
        }
    }


    addContact(contact: Contact): void {
        const newContact: Contact = {
            ...contact,
            id: Date.now(),
        }

        this.contacts.push(newContact);
        this.saveContacts();
        
    }

    updateContact(contact: Contact): void {
        const index = this.contacts.findIndex(c => c.id === contact.id);
        if (index === -1) {
            console.log('Contact not found.');
        } else {
            this.contacts[index] = {
                ...this.contacts[index],
                name: contact.name,
                email: contact.email,
                phone: contact.phone
            };
            this.saveContacts();
        }
    }

    deleteContact (id: number): void {
        this.contacts = this.contacts.filter(c => c.id !== id);

        if(this.contacts.length > 0) {
            this.saveContacts();
        }
        
    }

    getAllContacts(): Contact[] {
        return this.contacts;
    }
  
}


class ContactUI {
    contactManager: ContactManager;
    form: HTMLFormElement;
    nameInput: HTMLInputElement;
    emailInput: HTMLInputElement;
    phoneInput: HTMLInputElement;
    contactList: HTMLDivElement;
    searchInput: HTMLInputElement;
    editingId: number | null = null;

    constructor() {
        this.contactManager = new ContactManager();
        this.form = document.querySelector('form') as HTMLFormElement;
        this.nameInput = document.querySelector('#name') as HTMLInputElement;
        this.emailInput = document.querySelector('#email') as HTMLInputElement;
        this.phoneInput = document.querySelector('#phone') as HTMLInputElement;
        this.contactList = document.getElementById('contact') as HTMLDivElement;
        this.searchInput = document.getElementById('search') as HTMLInputElement;
        this.SearchContacts();
        
        
        
        this.init();
        this.displayContacts();
    }
    SearchContacts() {
        this.searchInput.addEventListener('input', (e: Event) => {
            const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
            const contacts = this.contactManager.getAllContacts();

            const filteredContacts = contacts.filter(contact => 
                contact.name.toLowerCase().includes(searchTerm) || contact.email.toLowerCase().includes(searchTerm) || contact.phone.toLowerCase().includes(searchTerm));

            if(filteredContacts.length === 0) {
                this.contactList.innerHTML = `<p>No contacts found.</p>`;
                return;
            }
            this.contactList.innerHTML = '';
            filteredContacts.forEach(contact => {
                this.addContactToUI(contact);
            });
        })
    }

    init(): void {
        this.form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            
            const contact: Contact = {
                id: this.editingId || Date.now(),
                name: this.nameInput.value,
                email: this.emailInput.value,
                phone: this.phoneInput.value
            };

            if(this.editingId) {
                this.contactManager.updateContact(contact);
                const submitBtn = this.form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.textContent = 'Add Contact';
                }
                this.editingId = null;
            } else {
                this.contactManager.addContact(contact);
            }

            
            this.displayContacts();
            this.form.reset();
        });

        this.contactList.addEventListener('click', (e: Event) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('fa-pen')) {
                const id = parseInt(target.getAttribute('data-id') || '');
                const contact = this.contactManager.getAllContacts().find(c => c.id === id);
                if (contact) {
                    this.nameInput.value = contact.name;
                    this.emailInput.value = contact.email;
                    this.phoneInput.value = contact.phone;
                    this.editingId = contact.id;

                    const submitBtn = this.form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.textContent = 'Update Contact';
                    }
                }
            } else if (target.classList.contains('fa-trash')) {
                const id = parseInt(target.getAttribute('data-id') || '0');
                if (confirm('Are you sure you want to delete this contact?')) {
                    this.deleteContact(id);
                }
            }
        });
    }

    addContactToUI(contact: Contact): void {
        const contactElement = document.createElement('div');
        contactElement.classList.add('contact');
        // const ul
         

        contactElement.innerHTML = `
            <li class="contact-item">
            <div class="upper">
                <i class="fa-solid fa-user"></i>
                <h2>${contact.name}</h2>
                <div class="icons">
                <i class="fa-solid fa-pen" data-id="${contact.id}"></i>
                <i class="fa-solid fa-trash" data-id="${contact.id}"></i>
                </div>
            </div>
            <div class="down">
                <p>${contact.phone}</p>
                <p>${contact.email}</p>
            </div>
            </li>
        `;
        this.contactList.appendChild(contactElement);
    }

    displayContacts(): void {
        this.contactList.innerHTML = '';
        const contacts = this.contactManager.getAllContacts();
        contacts.forEach(contact => {
            this.addContactToUI(contact);
        });
        this.updateContactCount();
    }
    
    deleteContact(id:number) : void {
        this.contactManager.deleteContact(id);
        this.displayContacts();
        this.contactManager.saveContacts();
    }
    updateContactCount():void {
        const contactCountElement = document.getElementById('contactCount');
        if (contactCountElement) {
            contactCountElement.textContent = this.contactManager.getAllContacts().length.toString();
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new ContactUI();
    
});