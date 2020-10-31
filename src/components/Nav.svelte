<script>
  export let segment;
  const { session } = stores();
</script>

<style>
  nav {
    border-bottom: 1px solid rgba(255, 62, 0, 0.1);
    font-weight: 300;
    padding: 0 1em;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  /* clearfix */
  ul::after {
    content: "";
    display: block;
    clear: both;
  }

  li {
    display: block;
    float: left;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: "";
    width: calc(100% - 1em);
    height: 2px;
    background-color: rgb(255, 62, 0);
    display: block;
    bottom: -1px;
  }

  a {
    text-decoration: none;
    padding: 1em 0.5em;
    display: block;
  }

  .login {
    float: right;
  }
</style>

<nav>
  <ul>
    <li>
      <a
        aria-current={segment === undefined ? 'page' : undefined}
        href=".">home</a>
    </li>
    <li>
      <a
        aria-current={segment === 'campers' ? 'page' : undefined}
        href="campers">campers</a>
    </li>
    <li>
      <a
        aria-current={segment === 'picrews' ? 'page' : undefined}
        href="picrews">picrews</a>
    </li>
    <li>
      <a
        aria-current={segment === 'guess' ? 'page' : undefined}
        href="guess">guess</a>
    </li>
    <li>
      <a
        aria-current={segment === 'picrewss' ? 'page' : undefined}
        href="picrewss">picrewss</a>
    </li>
    <li>
      <a
        aria-current={segment === 'settings' ? 'page' : undefined}
        href="settings">settings</a>
    </li>
    {#if $session.authenticated}
      <li>{$session.camper.name}</li>
    {/if}
    <li class:login={true}>
      {#if $session.authenticated}
        <a href="/picramp/logout">logout</a>
      {:else}<a href="/picramp/login">login</a>{/if}
    </li>
  </ul>
</nav>
