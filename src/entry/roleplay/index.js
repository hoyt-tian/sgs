import React from 'react'
import ReactDom from 'react-dom'
import WarRoom from '../../component/warroom'
import { Provider } from 'react-redux'
import { store } from '../../redux'

ReactDom.render(<Provider store={store}><WarRoom /></Provider>, document.getElementById('root'))
