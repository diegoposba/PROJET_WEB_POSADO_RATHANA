Vue.createApp({
    data() {
        return {
            seconds: 0, // Initialisation du temps
            map: null,
            inventoryActive: false, // Permet de savoir si l'inventaire est ouvert ou non
            inventoryItems: [], // Liste contenant les objets présents dans l'inventaire
            selectedItem: null,
            markers: [], // Liste de tous les marqueurs
            username : '', // Nom entré par l'utilisateur

            // Récupération du flux WMS provenant du geoserver
            triche: L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
                layers: 'Heat_Map_DiegoClement:objets', 
                format: 'image/png',
                transparent: true,
            }),
        };
    },

    computed: {
        formattedTime() {
            const minutes = Math.floor(this.seconds / 60);
            const displaySeconds = this.seconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
        }
    },
    
    methods: {

        toggleInventory() {
            this.inventoryActive = !this.inventoryActive;
        },

        // Fonction pour récupérer les objets depuis l'API
        fetchObjets() {
            fetch('/api/objets')
                .then(response => response.json())
                .then(data => {
                    this.objets = data.objets || []; // Récupérer les objets de l'API
                    this.markers = []; // Réinitialiser la liste des marqueurs
    
                    let mark = [];
    
                    // Créer les marqueurs pour chaque objet
                    this.objets.forEach((objet, index) => {
                        const lat = objet.geojson.coordinates[1];
                        const lng = objet.geojson.coordinates[0];
                        const zoomLevel = objet.niveau_zoom;
    
                        const Icon = L.icon({
                            iconUrl: objet.chemin_image,
                            iconSize: [objet.hauteur, objet.largeur],
                        });
    
                        // Créer un marqueur
                        const marker = L.marker([lat, lng], { icon: Icon, zoom: zoomLevel });
                        
                        marker.initialLatLng = [lat, lng];

                        // Ajouter le marqueur à la liste des marqueurs
                       mark.push(marker);
                    });
    
                    // Stocker les marqueurs dans la variable markers
                    this.markers = mark;
                    

                    const self = this;
                    console.log(this.markers);
                    // Ajouter le premier marqueur et son popup
                    this.markers[0].bindPopup(`
                        <p><strong>Hola Amigo !</strong></p>
                        <p>Il ne reste plus de riz au restaurant pour de la paëlla, il nous en faut au plus vite !</p>
                        <p>Comme tu le sais ici nous utilisons uniquement du riz khmer soit venant du Cambodge, c'est pourquoi tu dois t'y rendre pour y récupérer le riz</p>
                        <p>Rends toi à l'aéroport pour y prendre l'avion, on compte sur toi !</p>
                        <p><strong>Suerte y gracias !</strong></p>
                    `).addTo(this.map);
                    
                    for (let i = 1; i <= 21; i++) {
                        if (this.markers[i]) {
                            this.markers[i].setOpacity(0);
                        }
                    }
                    
                    this.markers[0].on('click', function(){
                        self.markers[1].setOpacity(1);
                    });
    
                    // Bind les popups pour les autres marqueurs
                    this.markers[1].bindPopup(`
                        <p><strong>Bienvenido al aeropuerto de Valencia !</strong></p>
                        <p>Mince, il semble que votre ticket ne fonctionne pas et que la copie que nous avions préparée a été emmenée en ville par le Señor Ignacio</p>
                        <p>Je te conseille de te rendre du côté du stade de Mestalla, tu trouveras peut être ton ticket là bas</p>
                        <p>Mais dépêche-toi, le temps presse</p>
                    `).addTo(this.map);
                    
                    this.markers[2].bindPopup(`
                        <p><strong>Estadio de Mestalla</strong></p>
                        <p><strong>Speaker du stade:</strong> GOOOOOOOOOOL !! 3-0 en favor del Valencia CF</p>
                        <p><strong>Sécurité:</strong> Désolé monsieur, le ticket n'est plus ici, mais j'ai cru entendre que la personne qui l'avait était parti à la plage de la Malvarossa</p>
                        <p><strong>Annonce publicitaire:</strong> La France tente de révolutionner le monde de la tech avec...</p>
                    `).addTo(this.map);

                    this.markers[3].bindPopup(`
                        <p><strong>Platja de la Malvarossa</strong></p>
                        <p><strong>Serveur du chiringuito:</strong> Oh non ! Señor Ignacio vient de partir visiter la cité des arts et des sciences, à l'ouest du port.</p>
                        <p><strong>Bout de conversation entre des amis:</strong> T'as entendu parler du nouveau joujou qui permet de traduire un texte dans toutes les langues ?</p>
                    `).addTo(this.map);

                    this.markers[4].bindPopup(`
                        <p><strong>Ciudad de las Artes y las Ciencias</strong></p>
                        <p><strong>Guide touristique:</strong> Señor Ignacio faisait partie de ma visite et elle vient de se finir.. j'ai cru comprendre qu'il comptait flâner dans l'Albufera semblable à des rizières se situant au sud de Valence</p>
                        <p><strong>Touriste qui parle à son amie:</strong> Oui, moi je travail au plateau de SACLAY dans la recherche linguistique</p>
                    `).addTo(this.map);

                    this.markers[5].bindPopup(`
                        <p><strong>Albufera</strong></p>
                        <p><strong>Señor Ignacio:</strong> Oh je suis sincèrement désolé, je ne m'en étais pas aperçu... vous avez au moins pu visiter la ville ! Mais d'ailleurs, parlez-vous khmer ?</p>
                    `).addTo(this.map);
                    
                    this.markers[6].setOpacity(0);
                    this.markers[18].setOpacity(0);
                    this.markers[19].setOpacity(0);
                    
                    this.markers[5].on('click', function(){
                        self.markers[6].setOpacity(1);
                    });

                    this.markers[6].on('click', function(){
                        
                        self.objetToInventory({ imageUrl: self.markers[6].options.icon.options.iconUrl, name: "ticket"})
                        self.markers[6].setOpacity(0); 
                        self.markers[1].bindPopup(`
                            <p><strong>Aeropuerto de Valencia</strong></p>
                            <p>Veuillez préparer votre ticket afin de pouvoir embarquer</p>
                        `).addTo(this.map);       
                        
                    });

                    this.markers[20].setOpacity(1);
                    this.markers[20].bindPopup(`
                        <p><strong> Aéroport de Phnom Penh</strong> </p>
                        
                        <p><strong> Bora: </strong>សួស្តី យើងកំពុងរង់ចាំអ្នក។ ខ្ញុំឈ្មោះ បូរ៉ា ជាអ្នកស្រែ។ ម្យ៉ាងវិញទៀត អ្នកមិនមានអ្នកបកប្រែទេ? វានឹងពិបាកយល់</p>  
                    `).addTo(this.map);   
                    
                    const zoomLevelRequired = 15;

                    this.map.on('zoomend', function () {
                        const zoom = self.map.getZoom();  // Récupérer le niveau de zoom actuel
                        
                        // Vérifier chaque marqueur et ajuster la visibilité en fonction du niveau de zoom
                        self.markers.forEach(marker => {
                            const zoomLevel = marker.options.zoom;  // Niveau de zoom requis pour afficher le marqueur
                            
                            if (zoomLevel >= zoomLevelRequired) {
                                // Niveau de zoom suffisant, afficher les marqueurs
                                self.markers[2].setOpacity(1);
                                self.markers[3].setOpacity(1);
                                self.markers[4].setOpacity(1);
                                self.markers[5].setOpacity(1);
                            } else {
                                // Niveau de zoom insuffisant, masquer les marqueurs
                                self.markers[2].setOpacity(0);
                                self.markers[3].setOpacity(0);
                                self.markers[4].setOpacity(0);
                                self.markers[5].setOpacity(0);
                            }
                            // Si le niveau de zoom est suffisant pour afficher le marqueur
                            if (zoom >= zoomLevel) {
                                
                                    self.map.addLayer(marker);  // Ajouter le marqueur si il n'est pas déjà visible
                                
                            } else {
                                
                                    self.map.removeLayer(marker);  // Enlever le marqueur si le niveau de zoom est trop bas
                                
                            }
                        });
                    });
                     

                      
                    
                    this.markers[7].bindPopup(`
                        <p><strong> Traducteur universel </strong> </p>
                        <p>Vous avez entre les mains le traducteur dernier cri développé par © Saclay-mentPerformant! Toutefois, pour pouvoir bénéficier de toutes les fonctionnalités, il faut le dévérouiller en tapant le code secret. </p>
                        <p>Nous avons perdu la notice de cet exemplaire et ne pouvons pas vous le fournir... Par contre nous avons retrouvé un papier contenant les informations suivantes... </p>
                        <p><strong> Indice:</strong></p>
                        <p> " Vous qui avez la chance d'être un valide,</p>
                        <p>Combattez l'ennemi pleutre et félon. </p>
                        <p>Pour cela il faut qu'on corde de manière rapide</p>
                        <p>L'arc avec lequel nous triompherons.</p>
                        <p><strong>Code:</strong></p>

                        <form id="codeForm" style="margin-top: 10px;">
                        
                        <label for="inputPassword2" class="visually-hidden">Code</label>
                        <input type="text" class="form-control" id="inputPassword2" placeholder="Votre réponse" style="margin-bottom: 5px;">
                        <button type="submit" class="btn btn-danger mb-3">Valider</button>
                        </form>
                    `).addTo(this.map);

                    this.markers[7].on('popupopen', function () {
                        const codeForm = document.getElementById('codeForm'); // Sélectionner le formulaire
                        const inputField = document.getElementById('inputPassword2'); // Sélectionner le champ de saisie
                    
                        codeForm.addEventListener('submit', function (event) {
                            event.preventDefault(); // Empêcher la soumission par défaut
                    
                            const userInput = inputField.value.trim(); // Récupérer et nettoyer la saisie de l'utilisateur
                    
                            if (userInput === '4574') { // Si le code est correct
                                self.markers[17].setOpacity(1);
                                alert('Félicitations, le code est correct ! Le traducteur a été ajouté à votre inventaire');
                                self.markers[7].setOpacity(0);
                                self.markers[20].setOpacity(1);
                                self.objetToInventory({ imageUrl: self.markers[7].options.icon.options.iconUrl, name: "traducteur"});
                                
                                
                                self.markers[17].on('click', function(){
                                    self.map.setView([11.551792881624623, 104.84633588678238], 13);
                                });
                                console.log('Le code correct a été entré :', userInput);
                            } else { // Si le code est incorrect
                                alert('Code incorrect. Retentez votre chance.');
                                console.log('Code incorrect entré :', userInput);
                            }
                        });
                    });
                    
                    
                    this.markers[7].on('click', function(){
                        for (let i = 7; i <= 16; i++) {
                            self.markers[i].setOpacity(1);
                        }
                    });

                    this.markers[8].bindPopup(`
                        <p><strong> Tour Eiffel</strong> </p>
                        <p> L'adresse de ce monument emblématique de la France est le ... avenue Anatole France.</p>  
                    `).addTo(this.map);
                    
                    this.markers[9].bindPopup(`
                        <p><strong> Les Invalides</strong> </p>
                        <p> Cette structure impressionante abrite les sépultures de ... Bonaparte. </p>   
                    `).addTo(this.map);
                    
                    this.markers[10].bindPopup(`
                        <p><strong> Cathédrale Notre-Dame de Paris</strong> </p>
                        <p> Dans cette cathédrale iconique de la ville de Paris, ... empereurs ont été intronisés </p>  
                    `).addTo(this.map);
                    
                    this.markers[11].bindPopup(`
                        <p><strong> Arc de Triomphe</strong> </p>
                        <p> Il y a ... grands reliefs représentant des victoires militaires et des evenements historiques sculptés sur ce monument.</p>  
                    `).addTo(this.map);
                    
                    this.markers[12].bindPopup(`
                        <p><strong> Musée du Louvre</strong> </p>
                        <p> Le musée comporte un total de ... portes principales !</p>  
                    `).addTo(this.map);
                    this.markers[13].bindPopup(`
                        <p><strong> Place de la Concorde</strong> </p>
                        <p> Si on fait la somme des numéros de métros qui passent par la station associée, on obtient ....</p> 
                    `).addTo(this.map);
                    
                    this.markers[14].bindPopup(`
                        <p><strong> Panthéon</strong> </p>
                        <p> Dans ce bâtiment est stocké le pendule de Foucault, qui mesure ... mètres de long environs.</p>  
                   `).addTo(this.map);
                    
                    this.markers[15].bindPopup(`
                        <p><strong> Basilique du Sacré-Coeur</strong> </p>
                        <p> On peut parfois y entendre sonner ses ... cloches.</p>  
                    `).addTo(this.map);
                    
                    this.markers[16].bindPopup(`
                        <p><strong> Opéra Garnier</strong> </p>
                        <p> Il a été construit avec ... types différents de marbre !</p>  
                    `).addTo(this.map);
                    

                    
                    
                });
                
        },

        objetToInventory(item) {
            if (!this.inventoryItems.some(existingItem => existingItem.name === item.name)) {
                this.inventoryItems.push(item);
            }
        },


        selectItem(item) {
            this.selectedItem = item;  // Marquer l'objet comme sélectionné
            const self = this;
            if(item.name === "ticket"){                

                this.markers.forEach(marker => {
                    // Réinitialisez la position du marqueur à sa position d'origine
                    if (marker.initialLatLng) {
                        marker.setLatLng(marker.initialLatLng);
                    }
                });
                
                this.markers[1].bindPopup(`
                    <p><strong>Prêt au décollage !</strong></p>
                    <p>Veuillez choisir la destination où vous souhaitez aller</p>
                `).addTo(this.map);
                

                this.markers[18].on('click', function(){
                    if (item.name === "ticket") {
                        self.map.setView([49.012030387445044, 2.5468684771972105], 13);
                    }
                    
                });
                
                this.markers[19].on('click', function(){
                    if (item.name === "ticket") {
                        self.map.setView([11.551792881624623, 104.84633588678238], 13);
                    }
                    
                });  

                this.markers[18].setOpacity(1);
                this.markers[19].setOpacity(1);
                this.markers[7].setOpacity(1);  
            }

            if(item.name === "traducteur"){
                
                

                this.markers[20].bindPopup(`
                    <p><strong> Aéroport de Phnom Penh</strong> </p>
                
                    <p><strong> Bora: </strong>Bonjour je suis Bora, je suis votre fournisseur de riz. Vous trouverez le sac de riz que j'ai stocké dans le temple d'Angkor Wat.</p>  
                `).addTo(this.map);
                this.markers[21].setOpacity(1);
                this.markers[21].on('click', function(){
                        
                    self.objetToInventory({ imageUrl: self.markers[21].options.icon.options.iconUrl, name: "riz"})
                    self.markers[21].setOpacity(0);
                });
                
            }

            if(item.name === "riz") {
                
                this.markers[20].unbindPopup(); 
                this.markers[20].addTo(this.map);
            
                this.markers[20].on('click', function() {
                    
                    self.map.setView([39.4699, -0.3763], 13); 
                });

                this.markers[0].unbindPopup();
                this.markers[0].addTo(this.map);

                this.markers[0].on('click', function(){
                    self.finishGame();
                });
            }
        },

        finishGame() {
            const time = `00:${this.formattedTime}`;
            const username = this.username;
            console.log('Temps envoyé :', time);
            fetch('/api/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, time })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Réponse reçue de l\'API :', data);
                
                // Peu importe si le temps est mis à jour ou non, on affiche l'alerte et on redirige
                alert(`Jeu terminé ! Votre temps: ${time}`);
                window.location.href = '/classement'; 
            })
            .catch(err => {
                console.error("Erreur lors de l'appel à l'API : ", err);
                alert(`Erreur lors de l'enregistrement du temps: ${time}`);
                window.location.href = '/classement';
            });
        },

        toggleWMSLayer() {
        
            const checkbox = document.getElementById('cheatCheckbox');
            
            // Vérifier si la checkbox est cochée
            if (checkbox.checked) {
                // Ajouter la couche WMS sur la carte
                this.triche.addTo(this.map);
            } else {
                // Supprimer la couche WMS de la carte
                this.map.removeLayer(this.triche);
            }
        },

        
    },
 
    mounted() {
        this.username = document.getElementById("pseudo").innerText;
        this.map = L.map('map').setView([39.4699, -0.3763], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    
        this.fetchObjets();
        
        const checkbox = document.getElementById('cheatCheckbox');
        checkbox.addEventListener('change', this.toggleWMSLayer);

        setInterval(() => {
            this.seconds++;
        }, 1000);
    }
    

}).mount('body');













