(function() {

    var apiURL = 'https://deliver.kenticocloud.com/f838c20b-6429-46dd-89aa-e14f3f5d83ed/items/deepend_technical_team';

    var app = new Vue({
        el: '#personList',
        data: {
            peps: ''
        },
        mounted: function() {
            this.getJsonInfo()
        },
        methods: {
            getJsonInfo: function() {
                this.$http.get(apiURL).then(function(response) {
                    var resdata = response.data.modular_content;
                    this.peps = resdata;

                }).catch(function(response) {
                    console.log(response)
                })
            }
        }
    })


})();