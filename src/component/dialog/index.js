import React from 'react'
import './index.less'

class Dialog extends React.PureComponent {

  renderFooter(type) {
    const { onResolve, onReject, okText = '确定', cancelText = '取消' } = this.props
    return type === 'confirm' && <footer><button onClick={() => onResolve()} >{okText}</button><button onClick={() => {
      onReject()
    }}>{cancelText}</button></footer>
  }

  render() {
    const {title, content, type = 'confirm'} = this.props

    return <section className="dialog">
      <div className="box">
        {title && <header>{title}</header>}
        {content && <div className="content">{content}</div>}
        {this.renderFooter(type)}
      </div>
    </section>
  }
}

export default Dialog
