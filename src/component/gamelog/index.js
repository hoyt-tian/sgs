import React from 'react'
import './index.less'
class Gamelog extends React.PureComponent {

  renderLog(l) {
    return <div>{l}</div>
  }

  render() {
    const logs = this.props.logs || []
    return <section className="game-log">
      {logs.map(l => this.renderLog(l))}
    </section>
  }
}

export default Gamelog