import { AdvancedDynamicTexture,
  Button, Control, Rectangle,
  InputText, TextBlock, ScrollViewer
} from "@babylonjs/gui";
import { navigate } from "../../router";
import { type Match, createMatch, updateMatchResult,
  type Tournament, launchTournament, joinTournamentAsGuest,
  joinTournamentAsLogged, startTournament, nextTournamentMatch
} from "../APIStorageManager";

export default class PgGui {
  hostPlayer: string;

  ui: AdvancedDynamicTexture;

  font: Rectangle;
  font2: Rectangle;

  goBackUI: string = "";
  goBackButton: Button;

  currentMatch: Match | null = null;
  currentTournament: Tournament | null = null;

  startedType: string = "";

  menu: {
    title: TextBlock,
    local: Button,
    vsAI: Button,
    tournament: Button,
    watchAI: Button,
    quit: Button,
    visibility(visible: boolean): void
  };

  vsFriend: {
    title: TextBlock,
    login: Button,
    guest: Button,
    visibility(visible: boolean): void
  };

  tournament: {
    title: TextBlock,
    host: TextBlock,
    hostPlayer: TextBlock,
    selectSize: TextBlock,
    size4: TextBlock,
    size8: TextBlock,
    size16: TextBlock,
    switchToPlayersSetting(nbPlayers: number): void,
    addGuest: Button,
    addLogin: Button,
    numberOfAI: TextBlock,
    playersScrollViewer: {
      scrollViewer: ScrollViewer,
      title: TextBlock,
      playersBlock: Rectangle,
      players: TextBlock[],
    },
    addPlayer(player: {id: string, name: string}): void,
    resetplayers: Button,
    start: Button,
    visibility(visible: boolean): void
  };

  match: {
    matchBlock: Rectangle,
    title: TextBlock,
    player1: TextBlock,
    player2: TextBlock,
    constVS: TextBlock,
    play: Button,
    visibility(visible: boolean): void
  };

  pause: {
    title: TextBlock,
    resume: Button,
    restart: Button,
    menu: Button,
    quit: Button,
    isPaused(): boolean
    visibility(visible: boolean): void
  };

  result: {
    title: TextBlock,
    player: TextBlock,
    wins: TextBlock,
    playAgain: Button,
    nextMatch: Button,
    menu: Button,
    show(): void,
    visibility(visible: boolean): void
  };

  login: {
    title: TextBlock,
    username: InputText,
    password: InputText,
    login: Button,
    visibility(visible: boolean, prevUI?: any): void
  };

  vsAI: {
    title: TextBlock,
    restless: Button,
    normal: Button,
    smart: Button,
    start: Button,
    visibility(visible: boolean): void
  };

  watchAI: {
    title: TextBlock,
    left: {
      title: TextBlock,
      restless: Button,
      normal: Button,
      smart: Button
    },
    right: {
      title: TextBlock,
      restless: Button,
      normal: Button,
      smart: Button
    },
    start: Button,
    visibility(visible: boolean): void
  };

  score: {
    left: TextBlock,
    right: TextBlock,
    constHyphen: TextBlock,
    update(scoreSide: "left" | "right", score: number): void,
    visibility(visible: boolean): void
  };
  
  panel: {
    block: Rectangle,
    players: {
      block: Rectangle,
      player1: TextBlock,
      player2: TextBlock,
      constVS: TextBlock
    };
    winParts: {
      block: Rectangle,
      title: TextBlock,
      player1: TextBlock,
      player2: TextBlock,
      constHyphen: TextBlock
    };
    speed: {
      block: Rectangle,
      title: TextBlock,
      value: TextBlock,
      unit: TextBlock,
      update(value: number): void
    };
    visibility(visible: boolean): void
  };

  constructor(hostPlayer: string) {
    this.hostPlayer = hostPlayer;

    this.ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
    this.panel = this.initPanel();
    this.score = this.initScore();

    const font = new Rectangle("font"); {
      font.background = "black";
      font.alpha = 0.4;
      this.ui.addControl(font);
    }
    this.font = font;

    const goBackButton = Button.CreateSimpleButton("goBackButton", "← Go Back"); {
      goBackButton.width = 200 + "px";
      goBackButton.height = 60 + "px";
      goBackButton.top = "300px";
      goBackButton.left = "-50px";
      goBackButton.fontSize = 34 + "px";
      goBackButton.color = "white";
      goBackButton.thickness = 0;
      goBackButton.background = "transparent";
      goBackButton.alpha = 0.7;
      goBackButton.isVisible = false;
      goBackButton.onPointerEnterObservable.add(() => {
        goBackButton.color = "green";
        goBackButton.alpha = 1;
      });
      goBackButton.onPointerOutObservable.add(() => {
        goBackButton.color = "white";
        goBackButton.alpha = 0.7;
      });
      goBackButton.onPointerClickObservable.add(() => {
        this.goBack();
      });
      this.ui.addControl(goBackButton);
    }
    this.goBackButton = goBackButton;
    
    this.menu = this.initMenu();
    this.vsFriend = this.initVSFriend();
    this.tournament = this.initTournament();
    this.match = this.initMatch();
    this.pause = this.initPause();
    this.result = this.initResult();

    const font2 = new Rectangle("font2"); {
      font2.background = "black";
      font2.alpha = 0.4;
      this.ui.addControl(font2);
    }
    this.font2 = font2;

    this.login = this.initLogin();
    this.vsAI = this.initVsAI();
    this.watchAI = this.initWatchAI();

    // this.menu.visibility(false);
    this.tournament.visibility(false);
    this.match.visibility(false);
    this.vsFriend.visibility(false);
    this.pause.visibility(false);
    this.result.visibility(false);

    this.login.visibility(false);
    this.vsAI.visibility(false);
    this.watchAI.visibility(false);
  }

  started() {
    if (this.startedType !== "")
      return this.startedType;
    return null;
  }

  goBack() {
    this.menu.visibility(false);
    this.vsFriend.visibility(false);
    this.tournament.visibility(false);
    this.pause.visibility(false);
    this.result.visibility(false);

    if (this.goBackUI == "menu") {
      this.goBackButton.isVisible = false;
      this.menu.visibility(true);
    } else if (this.goBackUI == "tournament") {
      this.tournament.visibility(true);
    } else if (this.goBackUI == "pause") {
      this.goBackButton.isVisible = false;
      this.pause.visibility(true);
    } else if (this.goBackUI == "result") {
      this.goBackButton.isVisible = false;
      this.result.visibility(true);
    }
  }

  private initMenu() {
    const menuTitle = new TextBlock("menuTitle", "MENU"); {
      menuTitle.width = 450 + "px";
      menuTitle.height = 200 + "px";
      menuTitle.top = "-180px";
      menuTitle.fontSize = 132 + "px";
      menuTitle.color = "white";
      this.ui.addControl(menuTitle);
    }

    const playLocalButton = Button.CreateSimpleButton("playLocalButton", "Play vs Friend"); {
      playLocalButton.width = 250 + "px";
      playLocalButton.height = 60 + "px";
      playLocalButton.top = "-70px";
      playLocalButton.fontSize = 32 + "px";
      playLocalButton.color = "white";
      playLocalButton.thickness = 0;
      playLocalButton.background = "transparent";
      playLocalButton.alpha = 0.5;
      playLocalButton.onPointerEnterObservable.add(() => {
        playLocalButton.color = "purple";
        playLocalButton.alpha = 1;
      });
      playLocalButton.onPointerOutObservable.add(() => {
        playLocalButton.color = "white";
        playLocalButton.alpha = 0.5;
      });
      playLocalButton.onPointerClickObservable.add(() => {
        this.menu.visibility(false);

        if (this.goBackButton.isVisible == true && this.goBackUI == "pause") { // TODO
          // delete and clear current match or tournament
          this.currentMatch = null;
          this.currentTournament = null;
        }
        this.goBackUI = "menu";
        this.goBackButton.isVisible = true;
        // As Guest or Login temporarily
        this.vsFriend.visibility(true);
      });
      this.ui.addControl(playLocalButton);
    }

    const playVSAIButton = Button.CreateSimpleButton("playVSAIButton", "Play vs AI"); {
      playVSAIButton.width = 250 + "px";
      playVSAIButton.height = 60 + "px";
      playVSAIButton.fontSize = 32 + "px";
      playVSAIButton.color = "white";
      playVSAIButton.thickness = 0;
      playVSAIButton.background = "transparent";
      playVSAIButton.alpha = 0.5;
      playVSAIButton.onPointerEnterObservable.add(() => {
        playVSAIButton.color = "purple";
        playVSAIButton.alpha = 1;
      });
      playVSAIButton.onPointerOutObservable.add(() => {
        playVSAIButton.color = "white";
        playVSAIButton.alpha = 0.5;
      });
      playVSAIButton.onPointerClickObservable.add(() => {
        this.menu.visibility(false);

        if (this.goBackButton.isVisible == true && this.goBackUI == "pause") { // TODO
          // delete and clear current match or tournament
          this.currentMatch = null;
          this.currentTournament = null;
        }
        // this.goBackUI = "menu";
        // this.goBackButton.isVisible = true;
        // AI level selection
        createMatch("ai").then((match) => {
          this.currentMatch = match;
          this.startedType = "vsAI";
        });
      });
      this.ui.addControl(playVSAIButton);
    }

    const tournamentButton = Button.CreateSimpleButton("tournamentButton", "Tournament"); {
      tournamentButton.width = 250 + "px";
      tournamentButton.height = 60 + "px";
      tournamentButton.top = "70px";
      tournamentButton.fontSize = 32 + "px";
      tournamentButton.color = "white";
      tournamentButton.thickness = 0;
      tournamentButton.background = "transparent";
      tournamentButton.alpha = 0.5;
      tournamentButton.onPointerEnterObservable.add(() => {
        tournamentButton.color = "purple";
        tournamentButton.alpha = 1;
      });
      tournamentButton.onPointerOutObservable.add(() => {
        tournamentButton.color = "white";
        tournamentButton.alpha = 0.5;
      });
      tournamentButton.onPointerClickObservable.add(() => {
        this.menu.visibility(false);

        if (this.goBackButton.isVisible == true && this.goBackUI == "pause") { // TODO
          // delete and clear current match or tournament
          this.currentMatch = null;
          this.currentTournament = null;
        }
        this.goBackUI = "menu";
        this.goBackButton.isVisible = true;
        this.tournament.visibility(true);
      });
      this.ui.addControl(tournamentButton);
    }

    const watchAIButton = Button.CreateSimpleButton("watchAIButton", "Watch AI"); {
      watchAIButton.width = 250 + "px";
      watchAIButton.height = 60 + "px";
      watchAIButton.top = "140px";
      watchAIButton.fontSize = 32 + "px";
      watchAIButton.color = "white";
      watchAIButton.thickness = 0;
      watchAIButton.background = "transparent";
      watchAIButton.alpha = 0.5;
      watchAIButton.onPointerEnterObservable.add(() => {
        watchAIButton.color = "purple";
        watchAIButton.alpha = 1;
      });
      watchAIButton.onPointerOutObservable.add(() => {
        watchAIButton.color = "white";
        watchAIButton.alpha = 0.5;
      });
      watchAIButton.onPointerClickObservable.add(() => {
        this.menu.visibility(false);

        if (this.goBackButton.isVisible == true && this.goBackUI == "pause") { // TODO
          // delete and clear current match or tournament
          this.currentMatch = null;
          this.currentTournament = null;
        }
        // this.goBackUI = "menu";
        // this.goBackButton.isVisible = true;
        // Select AI level (restless, normal, smart) for each side
        this.startedType = "watchAI";
      });
      this.ui.addControl(watchAIButton);
    }

    const quitButton = Button.CreateSimpleButton("quitButton", "Quit"); {
      quitButton.width = 250 + "px";
      quitButton.height = 60 + "px";
      quitButton.top = "220px";
      quitButton.fontSize = 38 + "px";
      quitButton.color = "white";
      quitButton.cornerRadius = 20;
      quitButton.thickness = 0;
      quitButton.background = "transparent";
      quitButton.alpha = 0.7;
      quitButton.onPointerEnterObservable.add(() => {
        quitButton.color = "red";
      });
      quitButton.onPointerOutObservable.add(() => {
        quitButton.color = "white";
      });
      quitButton.onPointerClickObservable.add(() => {
        navigate("/select-game");
      });
      this.ui.addControl(quitButton);
    }

    const visibility = (value: boolean) => {
      Object.values(this.menu).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = value;
        }
      });
      this.font.isVisible = value;
    };

    return {
      title: menuTitle,
      local: playLocalButton,
      vsAI: playVSAIButton,
      tournament: tournamentButton,
      watchAI: watchAIButton,
      quit: quitButton,
      visibility
    };
  }

  private initVSFriend() {
    const title = new TextBlock("title", "VS FRIEND"); {
      title.width = 600 + "px";
      title.height = 130 + "px";
      title.top = "-100px";
      title.fontSize = 72 + "px";
      title.color = "white";
      this.ui.addControl(title);
    }

    const loginButton = Button.CreateSimpleButton("loginButton", "Login"); {
      loginButton.width = 200 + "px";
      loginButton.height = 60 + "px";
      loginButton.top = "50px";
      loginButton.left = "-100px";
      loginButton.fontSize = 32 + "px";
      loginButton.color = "white";
      loginButton.cornerRadius = 20;
      loginButton.thickness = 0;
      loginButton.background = "transparent";
      loginButton.alpha = 0.5;
      loginButton.onPointerEnterObservable.add(() => {
        loginButton.color = "purple";
        loginButton.alpha = 1;
      });
      loginButton.onPointerOutObservable.add(() => {
        loginButton.color = "white";
        loginButton.alpha = 0.5;
      });
      loginButton.onPointerClickObservable.add(() => {
        this.login.visibility(true);
      });
      this.ui.addControl(loginButton);
    }

    const guestButton = Button.CreateSimpleButton("guestButton", "Guest"); {
      guestButton.width = 200 + "px";
      guestButton.height = 60 + "px";
      guestButton.top = "50px";
      guestButton.left = "100px";
      guestButton.fontSize = 32 + "px";
      guestButton.color = "white";
      guestButton.cornerRadius = 20;
      guestButton.thickness = 0;
      guestButton.background = "transparent";
      guestButton.alpha = 0.5;
      guestButton.onPointerEnterObservable.add(() => {
        guestButton.color = "purple";
        guestButton.alpha = 1;
      });
      guestButton.onPointerOutObservable.add(() => {
        guestButton.color = "white";
        guestButton.alpha = 0.5;
      });
      guestButton.onPointerClickObservable.add(() => {
        createMatch("guest").then((match) => {
          this.currentMatch = match;
          this.startedType = "local";
        });
      });
      this.ui.addControl(guestButton);
    }

    const visibility = (visible: boolean) => {
      Object.values(this.vsFriend).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font.isVisible = visible;
    };

    return {
      title,
      login: loginButton,
      guest: guestButton,
      visibility
    };
  }

  private initTournament() {
    const tournamentTitle = new TextBlock("tournamentTitle", "TOURNAMENT"); {
      tournamentTitle.width = 600 + "px";
      tournamentTitle.height = 130 + "px";
      tournamentTitle.top = "-250px";
      tournamentTitle.fontSize = 72 + "px";
      tournamentTitle.color = "white";
      this.ui.addControl(tournamentTitle);
    }

    const hostText = new TextBlock("hostText", "Host:"); {
      hostText.width = 200 + "px";
      hostText.height = 60 + "px";
      hostText.top = "-150px";
      hostText.left = "-250px";
      hostText.fontSize = 32 + "px";
      hostText.color = "white";
      this.ui.addControl(hostText);
    }

    const hostPlayer = new TextBlock("hostPlayer", this.hostPlayer); {
      hostPlayer.width = 200 + "px";
      hostPlayer.height = 60 + "px";
      hostPlayer.top = "-150px";
      hostPlayer.left = "-125px";
      hostPlayer.fontSize = 42 + "px";
      hostPlayer.color = "purple";
      this.ui.addControl(hostPlayer);
    }

    const selectSizeText = new TextBlock("selectSizeText", "Select Size:"); {
      selectSizeText.width = 200 + "px";
      selectSizeText.height = 100 + "px";
      selectSizeText.top = "-150px";
      selectSizeText.left = "110px";
      selectSizeText.fontSize = 38 + "px";
      selectSizeText.color = "white";
      this.ui.addControl(selectSizeText);
    }

    const size4Text = new TextBlock("size4Text", "4 Players"); {
      size4Text.width = 200 + "px";
      size4Text.height = 60 + "px";
      size4Text.top = "-50px";
      size4Text.left = "110px";
      size4Text.fontSize = 32 + "px";
      size4Text.color = "white";
      size4Text.alpha = 0.5;
      size4Text.onPointerEnterObservable.add(() => {
        size4Text.alpha = 1;
      });
      size4Text.onPointerOutObservable.add(() => {
        size4Text.alpha = 0.5;
      });
      size4Text.onPointerClickObservable.add(() => {
        this.tournament.switchToPlayersSetting(4);
      });
      this.ui.addControl(size4Text);
    }

    const size8Text = new TextBlock("size8Text", "8 Players"); {
      size8Text.width = 200 + "px";
      size8Text.height = 60 + "px";
      size8Text.top = "25px";
      size8Text.left = "110px";
      size8Text.fontSize = 32 + "px";
      size8Text.color = "white";
      size8Text.alpha = 0.5;
      size8Text.onPointerEnterObservable.add(() => {
        size8Text.alpha = 1;
      });
      size8Text.onPointerOutObservable.add(() => {
        size8Text.alpha = 0.5;
      });
      size8Text.onPointerClickObservable.add(() => {
        this.tournament.switchToPlayersSetting(8);
      });
      this.ui.addControl(size8Text);
    }

    const size16Text = new TextBlock("size16Text", "16 Players"); {
      size16Text.width = 200 + "px";
      size16Text.height = 60 + "px";
      size16Text.top = "100px";
      size16Text.left = "110px";
      size16Text.fontSize = 32 + "px";
      size16Text.color = "white";
      size16Text.alpha = 0.5;
      size16Text.onPointerEnterObservable.add(() => {
        size16Text.alpha = 1;
      });
      size16Text.onPointerOutObservable.add(() => {
        size16Text.alpha = 0.5;
      });
      size16Text.onPointerClickObservable.add(() => {
        this.tournament.switchToPlayersSetting(16);
      });
      this.ui.addControl(size16Text);
    }

    const switchToPlayersSetting = (nbOfPlayers: number) => {
      launchTournament(nbOfPlayers).then((tournament) => {
        if (tournament == null) return;
        this.currentTournament = tournament;
      });

      // Hide size selection
      this.tournament.selectSize.isVisible = false;
      this.tournament.size4.isVisible = false;
      this.tournament.size8.isVisible = false;
      this.tournament.size16.isVisible = false;

      // Show players setting and Start button

      this.tournament.playersScrollViewer.players = [];
      // this.tournament.playersScrollViewer.playersBlock.height = "0px";
      this.tournament.playersScrollViewer.scrollViewer.isVisible = true;
      this.tournament.addLogin.isVisible = true;
      this.tournament.addGuest.isVisible = true;
      this.tournament.numberOfAI.text = `Number of AI: ${nbOfPlayers - 1}`;
      this.tournament.numberOfAI.isVisible = true;
      this.tournament.resetplayers.isVisible = true;
      this.tournament.start.isVisible = true;
    };

    const addLoginButton = Button.CreateSimpleButton("addLoginButton", "Add Login"); {
      addLoginButton.width = 200 + "px";
      addLoginButton.height = 60 + "px";
      addLoginButton.top = "-75px";
      addLoginButton.left = "-150px";
      addLoginButton.fontSize = 32 + "px";
      addLoginButton.color = "white";
      addLoginButton.thickness = 0;
      addLoginButton.background = "transparent";
      addLoginButton.alpha = 0.5;
      addLoginButton.onPointerEnterObservable.add(() => {
        addLoginButton.alpha = 1;
      });
      addLoginButton.onPointerOutObservable.add(() => {
        addLoginButton.alpha = 0.5;
      });
      addLoginButton.onPointerClickObservable.add(() => {
        // Add Login player
        if (this.currentTournament == null) return;
        this.login.visibility(true);
      });
      this.ui.addControl(addLoginButton);
    }

    const addGuestButton = Button.CreateSimpleButton("addGuestButton", "Add Guest"); {
      addGuestButton.width = 200 + "px";
      addGuestButton.height = 60 + "px";
      // addGuestButton.top = "25px";
      addGuestButton.left = "-150px";
      addGuestButton.fontSize = 32 + "px";
      addGuestButton.color = "white";
      addGuestButton.thickness = 0;
      addGuestButton.background = "transparent";
      addGuestButton.alpha = 0.5;
      addGuestButton.onPointerEnterObservable.add(() => {
        addGuestButton.alpha = 1;
      });
      addGuestButton.onPointerOutObservable.add(() => {
        addGuestButton.alpha = 0.5;
      });
      addGuestButton.onPointerClickObservable.add(() => {
        // Add Guest player
        if (this.currentTournament == null) return;
        joinTournamentAsGuest(this.currentTournament.id).then((player) => {
          if (player == null) return;
          this.tournament.addPlayer(player);
        });
      });
      this.ui.addControl(addGuestButton);
    }

    const numberOfAIText = new TextBlock("numberOfAIText", "Number of AI: 0"); {
      numberOfAIText.width = 400 + "px";
      numberOfAIText.height = 100 + "px";
      numberOfAIText.top = "100px";
      numberOfAIText.fontSize = 28 + "px";
      numberOfAIText.color = "white";
      numberOfAIText.left = "-150px";
      numberOfAIText.alpha = 0.7;
      this.ui.addControl(numberOfAIText);
    }

    const playersScrollViewer = new ScrollViewer("playersScrollViewer"); {
      playersScrollViewer.width = 200 + "px";
      playersScrollViewer.height = 410 + "px";
      playersScrollViewer.left = "110px";
      playersScrollViewer.barSize = 5;
      playersScrollViewer.barColor = "white";
      playersScrollViewer.background = "transparent";
      playersScrollViewer.thickness = 0;
      this.ui.addControl(playersScrollViewer);
    }

    const playersTitle = new TextBlock("playersTitle", "Players:"); {
      playersTitle.parent = playersScrollViewer;
      playersTitle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      playersTitle.width = "100%";
      playersTitle.height = "50px";
      playersTitle.top = "20px";
      playersTitle.fontSize = 38 + "px";
      playersTitle.color = "white";
      playersScrollViewer.addControl(playersTitle);
    }

    const playersBlock = new Rectangle("playersBlock"); {
      playersBlock.parent = playersScrollViewer;
      playersBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      playersBlock.width = "100%";
      playersBlock.height = "0px";
      playersBlock.top = "80px";
      playersBlock.left = "10px";
      playersBlock.color = "transparent";
      playersScrollViewer.addControl(playersBlock);
    }

    const addPlayer = (player: { id: string, name: string }) => {
      if (!this.currentTournament) return;
      const playerText = new TextBlock(`player${this.tournament.playersScrollViewer.players.length}`, player.name); {
        playerText.parent = this.tournament.playersScrollViewer.playersBlock;
        playerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        playerText.width = "100%";
        playerText.height = "50px";
        playerText.top = `${this.tournament.playersScrollViewer.players.length * 50 + 80}px`;
        playerText.left = "10px";
        playerText.fontSize = 28 + "px";
        playerText.color = "white";
      }
      this.tournament.playersScrollViewer.players.push(playerText);
      this.tournament.playersScrollViewer.playersBlock.height = `${this.tournament.playersScrollViewer.players.length * 55}px`;
      this.tournament.playersScrollViewer.playersBlock.addControl(playerText);
      this.tournament.numberOfAI.text = `Number of AI: ${this.currentTournament.max_players - this.tournament.playersScrollViewer.players.length}`;
    };

    const resetplayersButton = Button.CreateSimpleButton("resetplayersButton", "Reset Players"); {
      resetplayersButton.width = 300 + "px";
      resetplayersButton.height = 70 + "px";
      resetplayersButton.top = "240px";
      resetplayersButton.left = "110px";
      resetplayersButton.fontSize = 24 + "px";
      resetplayersButton.color = "white";
      resetplayersButton.thickness = 0;
      resetplayersButton.background = "transparent";
      resetplayersButton.alpha = 0.7;
      resetplayersButton.onPointerEnterObservable.add(() => {
        resetplayersButton.alpha = 1;
      });
      resetplayersButton.onPointerOutObservable.add(() => {
        resetplayersButton.alpha = 0.7;
      });
      resetplayersButton.onPointerClickObservable.add(() => {
        // Reset 
        this.tournament.playersScrollViewer.players = [];
        this.tournament.playersScrollViewer.playersBlock.clearControls();
        this.tournament.playersScrollViewer.playersBlock.height = "0px";
      });
      this.ui.addControl(resetplayersButton);
    }

    const startButton = Button.CreateSimpleButton("startButton", "Start"); {
      startButton.width = 300 + "px";
      startButton.height = 70 + "px";
      startButton.top = "200px";
      startButton.left = "-100px";
      startButton.fontSize = 42 + "px";
      startButton.color = "white";
      startButton.cornerRadius = 20;
      startButton.thickness = 0;
      startButton.background = "transparent";
      startButton.alpha = 0.7;
      startButton.onPointerEnterObservable.add(() => {
        startButton.alpha = 1;
      });
      startButton.onPointerOutObservable.add(() => {
        startButton.alpha = 0.7;
      });
      startButton.onPointerClickObservable.add(() => {
        // Start tournament
        if (this.currentTournament == null) return;
        startTournament(this.currentTournament.id).then((tournament) => {
          if (tournament == null) return;
          this.currentTournament = tournament;
          this.goBackButton.isVisible = false;
          this.tournament.visibility(false);
          this.startedType = "tournament";
        });
      });
      this.ui.addControl(startButton);
    }

    const visibility = (visible: boolean) => {
      Object.values(this.tournament).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.tournament.playersScrollViewer.scrollViewer.isVisible = visible;
      this.font.isVisible = visible;
      if (visible) {
        this.tournament.addLogin.isVisible = false;
        this.tournament.addGuest.isVisible = false;
        this.tournament.numberOfAI.isVisible = false;
        this.tournament.playersScrollViewer.scrollViewer.isVisible = false;
        this.tournament.resetplayers.isVisible = false;
        this.tournament.start.isVisible = false;
      }
    };

    return {
      title: tournamentTitle,
      host: hostText,
      hostPlayer: hostPlayer,
      selectSize: selectSizeText,
      size4: size4Text,
      size8: size8Text,
      size16: size16Text,
      switchToPlayersSetting,
      addGuest: addGuestButton,
      addLogin: addLoginButton,
      numberOfAI: numberOfAIText,
      playersScrollViewer: {
        scrollViewer: playersScrollViewer,
        title: playersTitle,
        playersBlock: playersBlock,
        players: [],
        isVisible: false
      },
      addPlayer,
      resetplayers: resetplayersButton,
      start: startButton,
      visibility
    }
  }

  private initMatch() {
    const matchBlock = new Rectangle("matchBlock"); {
      matchBlock.width = 600 + "px";
      matchBlock.height = 300 + "px";
      this.ui.addControl(matchBlock);
    }

    const matchTitle = new TextBlock("matchTitle", "MATCH"); {
      matchTitle.parent = matchBlock;
      matchTitle.width = 400 + "px";
      matchTitle.height = 100 + "px";
      matchTitle.top = "-100px";
      matchTitle.fontSize = 72 + "px";
      matchTitle.color = "white";
      matchBlock.addControl(matchTitle);
    }

    const player1Text = new TextBlock("player1Text", "Player 1"); {
      player1Text.parent = matchBlock;
      player1Text.width = 200 + "px";
      player1Text.height = 80 + "px";
      player1Text.left = "-150px";
      player1Text.fontSize = 42 + "px";
      player1Text.color = "purple";
      matchBlock.addControl(player1Text);
    }

    const vsText = new TextBlock("vsText", "VS"); {
      vsText.parent = matchBlock;
      vsText.width = 100 + "px";
      vsText.height = 80 + "px";
      vsText.fontSize = 42 + "px";
      vsText.fontStyle = "italic";
      vsText.color = "green";
      matchBlock.addControl(vsText);
    }

    const player2Text = new TextBlock("player2Text", "Player 2"); {
      player2Text.parent = matchBlock;
      player2Text.width = 200 + "px";
      player2Text.height = 80 + "px";
      player2Text.left = "150px";
      player2Text.fontSize = 42 + "px";
      player2Text.color = "purple";
      matchBlock.addControl(player2Text);
    }

    const playButton = Button.CreateSimpleButton("playButton", "Play"); {
      playButton.parent = matchBlock;
      playButton.width = 200 + "px";
      playButton.height = 70 + "px";
      playButton.top = "100px";
      playButton.fontSize = 42 + "px";
      playButton.color = "white";
      playButton.cornerRadius = 20;
      playButton.thickness = 0;
      playButton.background = "transparent";
      playButton.alpha = 0.7;
      playButton.onPointerEnterObservable.add(() => {
        playButton.alpha = 1;
      });
      playButton.onPointerOutObservable.add(() => {
        playButton.alpha = 0.7;
      });
      playButton.onPointerClickObservable.add(() => {
        // Start match
        if (this.currentMatch == null) return;
        this.startedType = "local";
      });
      matchBlock.addControl(playButton);
    }

    const visibility = (visible: boolean, player1?: string, player2?: string) => {
      Object.values(this.match).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      if (visible && player1 && player2) {
        player1Text.text = player1;
        player2Text.text = player2;
      }
    };

    return {
      matchBlock,
      title: matchTitle,
      player1: player1Text,
      player2: player2Text,
      constVS: vsText,
      play: playButton,
      visibility
    }
  }

  private initPause() {
    const pauseTitle = new TextBlock("pauseTitle", "PAUSE"); {
      pauseTitle.width = 450 + "px";
      pauseTitle.height = 180 + "px";
      pauseTitle.top = "-200px";
      pauseTitle.fontSize = 132 + "px";
      pauseTitle.color = "white";
      this.ui.addControl(pauseTitle);
    }
    
    const resumeButton = Button.CreateSimpleButton("resumeButton", "Resume"); {
      resumeButton.width = 250 + "px";
      resumeButton.height = 60 + "px";
      resumeButton.top = "-70px";
      resumeButton.fontSize = 32 + "px";
      resumeButton.color = "white";
      resumeButton.thickness = 0;
      resumeButton.background = "transparent";
      resumeButton.alpha = 0.5;
      resumeButton.onPointerEnterObservable.add(() => {
        resumeButton.color = "purple";
        resumeButton.alpha = 1;
      });
      resumeButton.onPointerOutObservable.add(() => {
        resumeButton.color = "white";
        resumeButton.alpha = 0.5;
      });
      resumeButton.onPointerClickObservable.add(() => {
        this.pause.visibility(false);
      });
      this.ui.addControl(resumeButton);
    }
    
    const restartButton = Button.CreateSimpleButton("restartButton", "Restart"); {
      restartButton.width = 250 + "px";
      restartButton.height = 60 + "px";
      restartButton.fontSize = 32 + "px";
      restartButton.color = "white";
      restartButton.thickness = 0;
      restartButton.background = "transparent";
      restartButton.alpha = 0.5;
      restartButton.onPointerEnterObservable.add(() => {
        restartButton.color = "purple";
        restartButton.alpha = 1;
      });
      restartButton.onPointerOutObservable.add(() => {
        restartButton.color = "white";
        restartButton.alpha = 0.5;
      });
      restartButton.onPointerClickObservable.add(() => {
        this.startedType = "restart";
        this.pause.visibility(false);
      });
      this.ui.addControl(restartButton);
    }

    const menuButton = Button.CreateSimpleButton("menuButton", "Menu"); {
      menuButton.width = 250 + "px";
      menuButton.height = 60 + "px";
      menuButton.top = "70px";
      menuButton.fontSize = 32 + "px";
      menuButton.color = "white";
      menuButton.thickness = 0;
      menuButton.background = "transparent";
      menuButton.alpha = 0.5;
      menuButton.onPointerEnterObservable.add(() => {
        menuButton.color = "purple";
        menuButton.alpha = 1;
      });
      menuButton.onPointerOutObservable.add(() => {
        menuButton.color = "white";
        menuButton.alpha = 0.5;
      });
      menuButton.onPointerClickObservable.add(() => {

        this.pause.visibility(false);
        this.goBackUI = "pause";
        this.goBackButton.isVisible = true;
        this.menu.visibility(true);
      });
      this.ui.addControl(menuButton);
    }

    const quitButton = Button.CreateSimpleButton("quitButton", "Quit"); {
      quitButton.width = 250 + "px";
      quitButton.height = 60 + "px";
      quitButton.top = "150px";
      quitButton.fontSize = 38 + "px";
      quitButton.color = "white";
      quitButton.cornerRadius = 20;
      quitButton.thickness = 0;
      quitButton.background = "transparent";
      quitButton.alpha = 0.7;
      quitButton.onPointerEnterObservable.add(() => {
        quitButton.color = "red";
      });
      quitButton.onPointerOutObservable.add(() => {
        quitButton.color = "white";
      });
      quitButton.onPointerClickObservable.add(() => {
        navigate("/select-game");
      });
      this.ui.addControl(quitButton);
    }

    const isPaused = () => {
      if (this.pause.title.isVisible || (this.goBackUI == "pause" && this.goBackButton.isVisible))
        return true;
      return false;
    };

    const visibility = (visible: boolean) => {
      Object.values(this.pause).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font.isVisible = visible;

      if (!visible && this.goBackUI == "pause" && this.goBackButton.isVisible) {
        this.goBackButton.isVisible = false;
        this.menu.visibility(false);
      }
    };

    return {
      title: pauseTitle,
      resume: resumeButton,
      restart: restartButton,
      menu: menuButton,
      quit: quitButton,
      isPaused,
      visibility
    }
  }

  private initResult() {
    const resultTitle = new TextBlock("resultTitle", "RESULT"); {
      resultTitle.width = 500 + "px";
      resultTitle.height = 200 + "px";
      resultTitle.top = "-180px";
      resultTitle.fontSize = 132 + "px";
      resultTitle.color = "white";
      this.ui.addControl(resultTitle);
    }

    const playerText = new TextBlock("playerText", "Player"); {
      playerText.width = 300 + "px";
      playerText.height = 80 + "px";
      playerText.left = "-120px";
      playerText.color = "purple";
      playerText.fontSize = 52 + "px";
      this.ui.addControl(playerText);
    }

    const winsText = new TextBlock("winsText", "Wins"); {
      winsText.width = 300 + "px";
      winsText.height = 100 + "px";
      winsText.left = "100px";
      winsText.color = "green";
      winsText.fontSize = 82 + "px";
      winsText.fontWeight = "bold";
      this.ui.addControl(winsText);
    }

    const playAgainButton = Button.CreateSimpleButton("playAgainButton", "Play Again"); {
      playAgainButton.width = 300 + "px";
      playAgainButton.height = 60 + "px";
      playAgainButton.top = "100px";
      playAgainButton.fontSize = 42 + "px";
      playAgainButton.color = "white";
      playAgainButton.thickness = 0;
      playAgainButton.background = "transparent";
      playAgainButton.alpha = 0.5;
      playAgainButton.onPointerEnterObservable.add(() => {
        playAgainButton.color = "purple";
        playAgainButton.alpha = 1;
      });
      playAgainButton.onPointerOutObservable.add(() => {
        playAgainButton.color = "white";
        playAgainButton.alpha = 0.5;
      });
      playAgainButton.onPointerClickObservable.add(() => {
        if (this.currentMatch == null) return;
        this.result.visibility(false);

        createMatch(this.currentMatch?.player2.type, this.panel.players.player2.text).then((match) => {
          if (match == null) return;
          this.currentMatch = match;
          this.result.visibility(false);
          this.startedType = "restart";
        });
      });
      this.ui.addControl(playAgainButton);
    }

    const nextMatchButton = Button.CreateSimpleButton("nextMatchButton", "Next Match"); {
      nextMatchButton.width = 300 + "px";
      nextMatchButton.height = 60 + "px";
      nextMatchButton.top = "100px";
      nextMatchButton.fontSize = 32 + "px";
      nextMatchButton.color = "white";
      nextMatchButton.thickness = 0;
      nextMatchButton.background = "transparent";
      nextMatchButton.alpha = 0.5;
      nextMatchButton.isVisible = false;
      nextMatchButton.onPointerEnterObservable.add(() => {
        nextMatchButton.color = "purple";
        nextMatchButton.alpha = 1;
      });
      nextMatchButton.onPointerOutObservable.add(() => {
        nextMatchButton.color = "white";
        nextMatchButton.alpha = 0.5;
      });
      nextMatchButton.onPointerClickObservable.add(() => {
        if (this.currentTournament == null) return;
        this.currentMatch = this.currentTournament.matches[0];

        this.result.visibility(false);
        this.startedType = "tournament";
      });
      this.ui.addControl(nextMatchButton);
    }

    const menuButton = Button.CreateSimpleButton("menuButton", "Menu"); {
      menuButton.width = 300 + "px";
      menuButton.height = 60 + "px";
      menuButton.top = "170px";
      menuButton.fontSize = 32 + "px";
      menuButton.color = "white";
      menuButton.thickness = 0;
      menuButton.background = "transparent";
      menuButton.alpha = 0.5;
      menuButton.onPointerEnterObservable.add(() => {
        menuButton.color = "purple";
        menuButton.alpha = 1;
      });
      menuButton.onPointerOutObservable.add(() => {
        menuButton.color = "white";
        menuButton.alpha = 0.5;
      });
      menuButton.onPointerClickObservable.add(() => {
        this.result.visibility(false);

        this.goBackUI = "result";
        this.menu.visibility(true);

      });
      this.ui.addControl(menuButton);
    }

    const show = () => {
      // update win parts
      if (this.score.left.text > this.score.right.text) {
        this.panel.winParts.player2.text = (parseInt(this.panel.winParts.player2.text) + 1).toString();
      } else {
        this.panel.winParts.player1.text = (parseInt(this.panel.winParts.player1.text) + 1).toString();
      }

      if (this.currentTournament && this.currentMatch) {
        nextTournamentMatch(parseInt(this.score.left.text), parseInt(this.score.right.text), this.currentMatch).then((tournament) => {
          if (tournament == null) return;
          this.currentTournament = tournament;
        });
      } else if (this.currentMatch) {
        updateMatchResult(parseInt(this.score.left.text), parseInt(this.score.right.text), this.currentMatch).then((res) => {
          if (!res) return;
          this.currentMatch = null;
        });
      }

      // reset score
      this.score.update("left", 0);
      this.score.update("right", 0);

      if (this.startedType != "watchAI") {
        this.startedType = "";
        this.result.visibility(true);
        return;
      }
      this.startedType = "restart";
    };

    const visibility = (visible: boolean) => {
      Object.values(this.result).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font.isVisible = visible;
      if (visible) {
        if (this.currentTournament) {
          this.result.playAgain.isVisible = false;
        } else {
          this.result.nextMatch.isVisible = false;
        }
        if (this.score.left.text > this.score.right.text) {
          this.result.player.text = this.panel.players.player1.text;
        } else {
          this.result.player.text = this.panel.players.player2.text;
        }
      }
    };

    return {
      title: resultTitle,
      player: playerText,
      wins: winsText,
      playAgain: playAgainButton,
      nextMatch: nextMatchButton,
      menu: menuButton,
      show,
      visibility
    };
  }

  private initLogin() {
    const loginTitle = new TextBlock("loginTitle", "LOGIN"); {
      loginTitle.width = 400 + "px";
      loginTitle.height = 130 + "px";
      loginTitle.top = "-250px";
      loginTitle.fontSize = 72 + "px";
      loginTitle.color = "white";
      this.ui.addControl(loginTitle);
    }

    const usernameInput = new InputText("usernameInput"); {
      usernameInput.width = 300 + "px";
      usernameInput.height = 60 + "px";
      usernameInput.top = "-50px";
      usernameInput.fontSize = 32 + "px";
      usernameInput.color = "white";
      usernameInput.background = "black";
      usernameInput.placeholderText = "Username";
      usernameInput.thickness = 0;
      this.ui.addControl(usernameInput);
    }

    const passwordInput = new InputText("passwordInput"); {
      passwordInput.width = 300 + "px";
      passwordInput.height = 60 + "px";
      passwordInput.top = "50px";
      passwordInput.fontSize = 32 + "px";
      passwordInput.color = "white";
      passwordInput.background = "black";
      passwordInput.placeholderText = "Password";
      passwordInput.thickness = 0;
      // passwordInput.type = "password";
      this.ui.addControl(passwordInput);
    }

    const loginButton = Button.CreateSimpleButton("loginButton", "Login"); {
      loginButton.width = 200 + "px";
      loginButton.height = 60 + "px";
      loginButton.top = "150px";
      loginButton.fontSize = 32 + "px";
      loginButton.color = "white";
      loginButton.thickness = 0;
      loginButton.background = "transparent";
      loginButton.alpha = 0.5;
      loginButton.onPointerEnterObservable.add(() => {
        loginButton.alpha = 1;
      });
      loginButton.onPointerOutObservable.add(() => {
        loginButton.alpha = 0.5;
      });
      loginButton.onPointerClickObservable.add(() => {
        // Perform login action here
        const username = usernameInput.text;
        const password = passwordInput.text;
        
        if (username === "" || password === "") {
          alert("Please enter both username and password.");
          return;
        }

        if (!this.currentTournament) {
          createMatch("registered", username, password).then((match) => {
            if (match == null) return;
            this.currentMatch = match;
            this.login.visibility(false);
          });
        } else {
          joinTournamentAsLogged(this.currentTournament.id, username, password).then((player) => {
            if (player == null) return;
            this.tournament.addPlayer(player);
            this.login.visibility(false);
          });
        }
      });
      this.ui.addControl(loginButton);
    }

    const visibility = (visible: boolean, prevUI?: any) => {
      Object.values(this.login).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font2.isVisible = visible;
      if (visible) {
        usernameInput.text = "";
        passwordInput.text = "";
      }
      else if (prevUI) {
        if ("visibility" in prevUI) {
          prevUI.visibility(false);
        }
      }
    };

    return {
      title: loginTitle,
      username: usernameInput,
      password: passwordInput,
      login: loginButton,
      visibility
    };
  }

  private initAIMode(offsetX?: number) {
    const AIModeTitle = new TextBlock("AIModeTitle", "AI Mode:"); {
      AIModeTitle.width = 400 + "px";
      AIModeTitle.height = 100 + "px";
      AIModeTitle.top = "-100px";
      AIModeTitle.left = offsetX ? `${offsetX}px` : "0px";
      AIModeTitle.fontSize = 42 + "px";
      AIModeTitle.color = "white";
      this.ui.addControl(AIModeTitle);
    }

    const restlessButton = Button.CreateSimpleButton("restlessButton", "Restless"); {
      restlessButton.width = 200 + "px";
      restlessButton.height = 60 + "px";
      restlessButton.top = "0px";
      restlessButton.left = offsetX ? `${offsetX - 220}px` : "-220px";
      restlessButton.fontSize = 32 + "px";
      restlessButton.color = "white";
      restlessButton.thickness = 0;
      restlessButton.background = "transparent";
      restlessButton.alpha = 0.5;
      restlessButton.onPointerEnterObservable.add(() => {
        restlessButton.alpha = 1;
      });
      restlessButton.onPointerOutObservable.add(() => {
        restlessButton.alpha = 0.5;
      });
      restlessButton.onPointerClickObservable.add(() => {
        // this.vsAI.AIModeTitle.text = "AI Mode: Restless";
        if (this.currentMatch) {
          this.currentMatch.player2.mode = "restless";
        }
        restlessButton.alpha = 1;
        normalButton.alpha = 0.5;
        smartButton.alpha = 0.5;
      });
      this.ui.addControl(restlessButton);
    }

    const normalButton = Button.CreateSimpleButton("normalButton", "Normal"); {
      normalButton.width = 200 + "px";
      normalButton.height = 60 + "px";
      normalButton.top = "0px";
      normalButton.left = offsetX ? `${offsetX}px` : "0px";
      normalButton.fontSize = 32 + "px";
      normalButton.color = "white";
      normalButton.thickness = 0;
      normalButton.background = "transparent";
      normalButton.alpha = 0.5;
      normalButton.onPointerEnterObservable.add(() => {
        normalButton.alpha = 1;
      });
      normalButton.onPointerOutObservable.add(() => {
        normalButton.alpha = 0.5;
      });
      normalButton.onPointerClickObservable.add(() => {
        // this.vsAI.AIModeTitle.text = "AI Mode: Normal";
        if (this.currentMatch) {
          this.currentMatch.player2.mode = "normal";
        }
        restlessButton.alpha = 0.5;
        normalButton.alpha = 1;
        smartButton.alpha = 0.5;
      });
      this.ui.addControl(normalButton);
    }

    const smartButton = Button.CreateSimpleButton("smartButton", "Smart"); {
      smartButton.width = 200 + "px";
      smartButton.height = 60 + "px";
      smartButton.top = "0px";
      smartButton.left = offsetX ? `${offsetX + 220}px` : "220px";
      smartButton.fontSize = 32 + "px";
      smartButton.color = "white";
      smartButton.thickness = 0;
      smartButton.background = "transparent";
      smartButton.alpha = 0.5;
      smartButton.onPointerEnterObservable.add(() => {
        smartButton.alpha = 1;
      });
      smartButton.onPointerOutObservable.add(() => {
        smartButton.alpha = 0.5;
      });
      smartButton.onPointerClickObservable.add(() => {
        // this.vsAI.AIModeTitle.text = "AI Mode: Smart";
        if (this.currentMatch) {
          this.currentMatch.player2.mode = "smart";
        }
        restlessButton.alpha = 0.5;
        normalButton.alpha = 0.5;
        smartButton.alpha = 1;
      });
      this.ui.addControl(smartButton);
    }

    return {
      title: AIModeTitle,
      restless: restlessButton,
      normal: normalButton,
      smart: smartButton
    };
  }

  private initVsAI() {
    const AIMode = this.initAIMode();

    const startButton = Button.CreateSimpleButton("startButton", "Start"); {
      startButton.width = 200 + "px";
      startButton.height = 60 + "px";
      startButton.top = "150px";
      startButton.fontSize = 32 + "px";
      startButton.color = "white";
      startButton.thickness = 0;
      startButton.background = "transparent";
      startButton.alpha = 0.5;
      startButton.onPointerEnterObservable.add(() => {
        startButton.alpha = 1;
      });
      startButton.onPointerOutObservable.add(() => {
        startButton.alpha = 0.5;
      });
      startButton.onPointerClickObservable.add(() => {
        // Start match vs AI
        createMatch("ai").then((match) => {
          if (match == null) return;
          this.currentMatch = match;
          this.vsAI.visibility(false);
          this.startedType = "vsAI";
        });
      });
      this.ui.addControl(startButton);
    }

    const visibility = (visible: boolean) => {
      Object.values(this.vsAI).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font2.isVisible = visible;
      if (visible) {
        // Reset AI mode selection
        AIMode.restless.alpha = 0.5;
        AIMode.normal.alpha = 0.5;
        AIMode.smart.alpha = 0.5;
      }
    };

    return {
      ...AIMode,
      start: startButton,
      visibility
    };
  }

  private initWatchAI() {
    const watchAITitle = new TextBlock("watchAITitle", "Watch AI"); {
      watchAITitle.width = 400 + "px";
      watchAITitle.height = 130 + "px";
      watchAITitle.top = "-250px";
      watchAITitle.fontSize = 72 + "px";
      watchAITitle.color = "white";
      this.ui.addControl(watchAITitle);
    }

    const leftAIMode = this.initAIMode(-220);
    const rightAIMode = this.initAIMode(220);

    const startButton = Button.CreateSimpleButton("startButton", "Start"); {
      startButton.width = 200 + "px";
      startButton.height = 60 + "px";
      startButton.top = "150px";
      startButton.fontSize = 32 + "px";
      startButton.color = "white";
      startButton.thickness = 0;
      startButton.background = "transparent";
      startButton.alpha = 0.5;
      startButton.onPointerEnterObservable.add(() => {
        startButton.alpha = 1;
      });
      startButton.onPointerOutObservable.add(() => {
        startButton.alpha = 0.5;
      });
      startButton.onPointerClickObservable.add(() => {
        // Start match vs AI // Without Backend
        this.watchAI.visibility(false);
        this.startedType = "watchAI";
      });
      this.ui.addControl(startButton);
    }

    const visibility = (visible: boolean) => {
      Object.values(this.watchAI).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      Object.values(this.watchAI.left).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      Object.values(this.watchAI.right).forEach((obj) => {
        if ("isVisible" in obj) {
          obj.isVisible = visible;
        }
      });
      this.font2.isVisible = visible;
      if (visible) {
        // Reset AI mode selection
        leftAIMode.restless.alpha = 0.5;
        leftAIMode.normal.alpha = 0.5;
        leftAIMode.smart.alpha = 0.5;
        rightAIMode.restless.alpha = 0.5;
        rightAIMode.normal.alpha = 0.5;
        rightAIMode.smart.alpha = 0.5;
      }
    };

    return {
      title: watchAITitle,
      left: leftAIMode,
      right: rightAIMode,
      start: startButton,
      visibility
    };
  }

  private initScore() {
    const hyphen = new TextBlock("constHyphen", "-"); {
      hyphen.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
      hyphen.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      hyphen.top = "-350px";
      hyphen.color = "white";
      hyphen.fontSize = 72 + "px";
      hyphen.isVisible = false;
      this.ui.addControl(hyphen);
    }

    const leftScore = new TextBlock("leftScore", "0".padEnd(2)); {
      leftScore.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
      leftScore.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      leftScore.top = "-350px";
      leftScore.left = "-1040px";
      leftScore.color = "white";
      leftScore.fontSize = 72 + "px";
      leftScore.isVisible = false;
      this.ui.addControl(leftScore);
    }

    const rightScore = new TextBlock("rightScore", "0"); {
      rightScore.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      rightScore.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      rightScore.top = "-350px";
      rightScore.left = "1040px";
      rightScore.color = "white";
      rightScore.fontSize = 72 + "px";
      rightScore.isVisible = false;
      this.ui.addControl(rightScore);
    }

    const update = (scoreSide: "left" | "right", score: number) => {
      let scoreText = score.toString();
      if (scoreSide == "left")
        scoreText = scoreText.padEnd(2);
      this.score[scoreSide].text = scoreText;
    };

    const visibility = (visible: boolean) => {
      this.score.left.isVisible = visible;
      this.score.right.isVisible = visible;
      this.score.constHyphen.isVisible = visible;
    };

    return {
      left: leftScore,
      right: rightScore,
      constHyphen: hyphen,
      update,
      visibility
    };
  }

  private initPanel() {
    // Side Panel
    const panelBlock = new Rectangle("panelBlock"); {
      panelBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
      panelBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      panelBlock.width = "275px";
      panelBlock.height = "40%";
      panelBlock.background = "transparent";
      panelBlock.thickness = 0;
      panelBlock.isVisible = false;
    }

    const panelFontBlock = new Rectangle("panelFontBlock"); {
      panelFontBlock.parent = panelBlock;
      panelFontBlock.width = "100%";
      panelFontBlock.height = "100%";
      panelFontBlock.background = "black";
      panelFontBlock.alpha = 0.5;
      panelFontBlock.cornerRadiusZ = 20;
      panelFontBlock.thickness = 0;
      panelBlock.addControl(panelFontBlock);
    }
    
    const playersBlock = new Rectangle("playersBlock"); {
      playersBlock.parent = panelBlock;
      playersBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      playersBlock.width = "75%";
      playersBlock.height = "40%";
      playersBlock.top = "10px";
      playersBlock.thickness = 0;
    }

    const player1 = new TextBlock("player1", "Player1"); {
      player1.parent = playersBlock;
      player1.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
      player1.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      player1.left = "10px";
      player1.top = "10px";
      player1.color = "purple";
      player1.fontSize = 42 + "px";
      player1.fontWeight = "bold";
      playersBlock.addControl(player1);
    }

    const constVS = new TextBlock("constVS", "VS"); {
      constVS.parent = playersBlock;
      constVS.color = "green";
      constVS.fontSize = 32 + "px";
      playersBlock.addControl(constVS);
    }

    const player2 = new TextBlock("player2", "Player2"); {
      player2.parent = playersBlock;
      player2.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
      player2.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
      player2.left = "-10px";
      player2.top = "-10px";
      player2.color = "purple";
      player2.fontSize = 42 + "px";
      player2.fontWeight = "bold";
      playersBlock.addControl(player2);
    }
    panelBlock.addControl(playersBlock);
    
    const winPartsBlock = new Rectangle("winPartsBlock"); {
      winPartsBlock.parent = panelBlock;
      winPartsBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      winPartsBlock.width = "75%";
      winPartsBlock.height = "30%";
      winPartsBlock.top = "180px";
      winPartsBlock.thickness = 0;
    }
    
    const title = new TextBlock("title", "Win Parts"); {
      title.parent = winPartsBlock;
      title.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
      title.color = "green";
      title.fontSize = 32 + "px";
      title.fontWeight = "bold";
      winPartsBlock.addControl(title);
    }

    const p1 = new TextBlock("p1", "0"); {
      p1.parent = winPartsBlock;
      p1.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      p1.left = "20px";
      p1.top = "10px";
      p1.color = "purple";
      p1.fontSize = 28 + "px";
      winPartsBlock.addControl(p1);
    }

    const constHyphen = new TextBlock("constHyphen", "-"); {
      constHyphen.parent = winPartsBlock;
      constHyphen.top = "10px";
      constHyphen.color = "green";
      constHyphen.fontSize = 28 + "px";
      winPartsBlock.addControl(constHyphen);
    }

    const p2 = new TextBlock("p2", "0"); {
      p2.parent = winPartsBlock;
      p2.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
      p2.top = "10px";
      p2.left = "-20px";
      p2.color = "purple";
      p2.fontSize = 28 + "px";
      winPartsBlock.addControl(p2);
    }
    panelBlock.addControl(winPartsBlock);
    
    const speedBlock = new Rectangle("speedBlock"); {
      speedBlock.parent = panelBlock;
      speedBlock.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
      speedBlock.width = "75%";
      speedBlock.height = "30%";
      speedBlock.top = "290px";
      speedBlock.thickness = 0;
    }
    
    const speedTitle = new TextBlock("speedTitle", "Speed"); {
      speedTitle.parent = speedBlock;
      speedTitle.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;
      speedTitle.color = "green";
      speedTitle.fontSize = 32 + "px";
      speedTitle.fontWeight = "bold";
      speedBlock.addControl(speedTitle);
    }

    const speedValue = new TextBlock("speedValue", "0.2"); {
      speedValue.parent = speedBlock;
      speedValue.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
      speedValue.left = "40px";
      speedValue.top = "10px";
      speedValue.color = "purple";
      speedValue.fontSize = 28 + "px";
      speedBlock.addControl(speedValue);
    }

    const speedUnit = new TextBlock("speedUnit", "/frame"); {
      speedUnit.parent = speedBlock;
      speedUnit.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_RIGHT;
      speedUnit.top = "10px";
      speedUnit.left = "-10px";
      speedUnit.color = "green";
      speedUnit.fontSize = 28 + "px";
      speedBlock.addControl(speedUnit);
    }
    panelBlock.addControl(speedBlock);

    const updateSpeed = (value: number) => {
      this.panel.speed.value.text = value.toString().slice(0, 5);
      this.panel.speed.value.top = "10px";
    };
    
    this.ui.addControl(panelBlock);

    const visibility = (visible: boolean) => {
      this.panel.block.isVisible = visible;
    };

    return {
      block: panelBlock,
      players: {
        block: playersBlock,
        player1: player1,
        player2: player2,
        constVS: constVS
      },
      winParts: {
        block: winPartsBlock,
        title: title,
        player1: p1,
        player2: p2,
        constHyphen: constHyphen
      },
      speed: {
        block: speedBlock,
        title: speedTitle,
        value: speedValue,
        unit: speedUnit,
        update: updateSpeed
      },
      visibility
    }
  }
}