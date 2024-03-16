async function get_all_emojis(){
    const base_url = 'https://emojihub.yurace.pro/api/all'
    const endpoint_list = [
        '/category/smileys-and-people',
        '/category/animals-and-nature',
        '/category/food-and-drink',
        '/category/travel-and-places',
        '/category/activities',
        '/category/objects',
        '/category/symbols',
        '/category/flags'
    ]
    let emoji_list = []
    for (let index = 0; index < endpoint_list.length; index++) {
        let emojis_category_data = await fetch(`${base_url}${endpoint_list[index]}`) 
        let emojis_category_data_json = await emojis_category_data.json()
        emoji_list.push(emojis_category_data_json)
        
    }

    console.log(emoji_list)
}

get_all_emojis()