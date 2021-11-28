(function () {
  var chat = {
    messageToSend: "",
    messageResponses: [
      "Why did the web developer leave the restaurant? Because of the table layout.",
      "How do you comfort a JavaScript bug? You console it.",
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      "What is the most used language in programming? Profanity.",
      "What is the object-oriented way to become wealthy? Inheritance.",
      "An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol",
    ],
    init: function () {
      this.cacheDOM();
      this.bindEvents();
      this.renderRequest();
    },
    cacheDOM: function () {
      this.$chatHistory = $(".chat-history");
      this.$button = $("button");
      this.$textarea = $("#message-to-send");
      this.$chatHistoryList = this.$chatHistory.find("ul");
    },
    bindEvents: function () {
      this.$button.on("click", this.addMessage.bind(this));
      this.$textarea.on("keyup", this.addMessageEnter.bind(this));
    },
    renderRequest: function (messageToSend) {
      this.scrollToBottom();
      if (messageToSend && messageToSend.trim() !== "") {
        var template = Handlebars.compile($("#message-template").html());
        var context = {
          messageOutput: messageToSend,
          time: this.getCurrentTime(),
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val("");
      }
    },
    renderResponse: function (response) {
      this.scrollToBottom();
      if (response.trim() !== "") {
        // responses
        var templateResponse = Handlebars.compile(
          $("#message-response-template").html()
        );
        var contextResponse = {
          response: response,
          time: this.getCurrentTime(),
        };

        this.$chatHistoryList.append(templateResponse(contextResponse));
        this.scrollToBottom();
      }
    },
    addMessage: function () {
      var messageToSend = this.$textarea.val().replaceAll('\n','');
      this.renderRequest(messageToSend);
      var query = parseQueryString(
        window.location.search + window.location.hash
      );
      var settings = {
        url: "/chat",
        method: "POST",
        data: messageToSend,
        dataType: "text",
        timeout: 0,
        headers: {
          Authorization: "Bearer " + query["accessToken"],
          "Content-Type": "text/plain"
        },
      };

      $.ajax(settings).done(
        function (response) {
          console.log(response);
          this.renderResponse(JSON.parse(response).responses[0]);
        }.bind(this)
      );
    },
    addMessageEnter: function (event) {
      // enter was pressed
      if (event.keyCode === 13) {
        this.addMessage();
      }
    },
    scrollToBottom: function () {
      this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function () {
      return new Date()
        .toLocaleTimeString()
        .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function (arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },
  };

  chat.init();
})();
