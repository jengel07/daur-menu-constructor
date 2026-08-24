const fs = require('fs');

function fixLayout(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix card-bottom-row flex-direction
  content = content.replace(
    /class="card-bottom-row" style="flex-direction: row; justify-content: space-between; width: 100%; align-items: center;"/g,
    'class="card-bottom-row" style="flex-direction: column; gap: 8px;"'
  );

  // Remove width: 'auto' from add-to-cart-btn inline styles inside the buttons for standard item adding
  content = content.replace(
    /:style="\{ backgroundColor: restaurantInfo\.primaryColor \|\| '#646cff', width: 'auto', padding: '6px 12px' \}"/g,
    `:style="{ backgroundColor: restaurantInfo.primaryColor || '#646cff', width: '100%', padding: '6px 12px' }"`
  );
  content = content.replace(
    /:style="\{ backgroundColor: currentRestaurantInfo\.primaryColor \|\| '#646cff', width: 'auto', padding: '6px 12px' \}"/g,
    `:style="{ backgroundColor: currentRestaurantInfo.primaryColor || '#646cff', width: '100%', padding: '6px 12px' }"`
  );

  fs.writeFileSync(file, content);
}

fixLayout('src/views/ClientView.vue');
fixLayout('src/components/PhoneMockupContent.vue');

console.log('Layout fixed to column for grid view');

