import { useState } from 'react'
import Header from '../../components/Header/Header'
import Explore from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = () => {
  const [category, setCategory] = useState('All')
  return (
    <main className='container'>
      <Header />
      <Explore category={category} setCategory={setCategory} />
      <FoodDisplay category={category} searchText={''}/>
    </main>
  )
}

export default Home