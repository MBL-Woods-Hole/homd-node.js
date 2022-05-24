
function registerFormCheck(){
    form = document.getElementById('newuser_form')
    spamguard_input = document.getElementById('spamguard_input').value.toUpperCase()
    spamguard_actual = form.spamcode1.value.toUpperCase()
   //alert('in ' +spamguard_input)
   //alert('actual ' +spamguard_actual)
    if(spamguard_input !== spamguard_actual){
      alert('Spam Guard Codes must match')
      return
    }
    
    
    form.submit()
}