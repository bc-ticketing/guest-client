<template>
  <div class="event">
    <div class="header">
      <div class="tab-headers">
        <h1>{{ event.title }}</h1>
        <router-link to="/event-list"
          ><md-icon>arrow_back_ios</md-icon></router-link
        >
      </div>
    </div>
    <div class="content" @scroll="handleScroll">
      <!-- big image -->
      <div class="header-img" :style="{ backgroundColor: `${event.color}` }">
        <img :src="event.image" alt="" />
      </div>

      <!-- general event information -->
      <section class="event-information higher" ref="firstinfo">
        <div class="container">
          <md-card>
            <md-card-content>
              <p class="event-description">
                {{ event.description }}
              </p>
              <div class="info-group">
                <md-icon class="info-title">location_on</md-icon>
                <span class="info-value">{{ event.location }}</span>
              </div>
              <div class="info-group">
                <md-icon class="info-title">event</md-icon>
                <span class="info-value">{{ event_date }}</span>
              </div>
              <div class="info-group">
                <md-icon class="info-title">label</md-icon>
                <span class="info-value tag">{{ event.category }}</span>
              </div>
              <div class="info-group">
                <md-icon class="info-title">local_offer</md-icon>
                <span class="info-value"
                  >From {{ lowest_price }}ETH/{{
                    getPriceConverted(lowest_price)
                  }}
                  CHF</span
                >
                <span
                  class="info-value"
                  style="margin-left: 1rem; display: inline-block;"
                  >(Max {{ max_tickets }} Tickets/Person)</span
                >
              </div>
            </md-card-content>
          </md-card>
        </div>
      </section>
      <!-- information about the host -->
      <section class="event-information lower">
        <div class="container">
          <md-card
            ><md-card-content>
              <h2>Organizer name</h2>
              <div class="info-group split">
                <div>
                  <md-icon class="info-title">link</md-icon>
                  <a class="info-value" :href="eventWebsite.url" target="_blank"
                    >Website</a
                  >
                </div>
                <div>
                  <span class="info-value-status">
                    <md-progress-spinner
                      v-if="eventWebsite.verification === 'pending'"
                      :md-diameter="20"
                      :md-stroke="4"
                      md-mode="indeterminate"
                    ></md-progress-spinner>
                    <span class="danger"
                      ><md-icon
                        class="danger"
                        v-if="eventWebsite.verification == false"
                        >warning</md-icon
                      ></span
                    >
                    <span class="good"
                      ><md-icon v-if="eventWebsite.verification == true"
                        >done</md-icon
                      ></span
                    >
                  </span>
                </div>
              </div>
              <div class="info-group split">
                <div>
                  <md-icon class="info-title">delete</md-icon>
                  <a class="info-value" :href="eventTwitter.url" target="_blank"
                    >Twitter</a
                  >
                </div>
                <div>
                  <span class="info-value-status">
                    <md-progress-spinner
                      v-if="eventTwitter.verification === 'pending'"
                      :md-diameter="20"
                      :md-stroke="4"
                      md-mode="indeterminate"
                    ></md-progress-spinner>
                    <span class="danger"
                      ><md-icon v-if="eventTwitter.verification == false"
                        >warning</md-icon
                      ></span
                    >
                    <span class="good"
                      ><md-icon v-if="eventTwitter.verification == true"
                        >done</md-icon
                      ></span
                    >
                  </span>
                </div>
              </div>
            </md-card-content></md-card
          >
        </div>
      </section>
      <!-- information about the identity service -->
      <section class="event-information lower">
        <div class="container">
          <md-card
            ><md-card-content>
              <h2>{{ approverTitle }}</h2>
              <div class="info-group split">
                <div>
                  <md-icon class="info-title">link</md-icon>
                  <a
                    class="info-value"
                    :href="approverWebsite.url"
                    target="_blank"
                    >Website</a
                  >
                </div>
                <div>
                  <span class="info-value-status">
                    <md-progress-spinner
                      v-if="approverWebsite.verification === 'pending'"
                      :md-diameter="20"
                      :md-stroke="4"
                      md-mode="indeterminate"
                    ></md-progress-spinner>
                    <span class="danger"
                      ><md-icon
                        class="danger"
                        v-if="approverWebsite.verification == false"
                        >warning</md-icon
                      ></span
                    >
                    <span class="good"
                      ><md-icon v-if="approverWebsite.verification == true"
                        >done</md-icon
                      ></span
                    >
                  </span>
                </div>
              </div>
              <div class="info-group split">
                <div>
                  <md-icon class="info-title">delete</md-icon>
                  <a
                    class="info-value"
                    :href="approverTwitter.url"
                    target="_blank"
                    >Twitter</a
                  >
                </div>
                <div>
                  <span class="info-value-status">
                    <md-progress-spinner
                      v-if="approverTwitter.verification === 'pending'"
                      :md-diameter="20"
                      :md-stroke="4"
                      md-mode="indeterminate"
                    ></md-progress-spinner>
                    <span class="danger"
                      ><md-icon
                        class="danger"
                        v-if="approverTwitter.verification == false"
                        >warning</md-icon
                      ></span
                    >
                    <span class="good"
                      ><md-icon v-if="approverTwitter.verification == true"
                        >done</md-icon
                      ></span
                    >
                  </span>
                </div>
              </div>
              <div class="info-group">
                <md-icon class="info-title">mail_outline</md-icon>
                <span class="info-value"
                  >{{ requiredIdentityLevel }} -
                  {{ requiredIdentityMethod }}</span
                >
              </div>
              <div class="info-group" v-if="userIsApproved">
                You are approved with {{ approverTitle }} at the required level
                to buy tickets.
              </div>
              <div class="info-group" v-else>
                You are not approved with {{ approverTitle }} at the required
                level to buy tickets.
              </div>
            </md-card-content></md-card
          >
        </div>
      </section>
      <!-- tickets -->
      <section class="tickets">
        <div class="container">
          <h2>Tickets</h2>
          <p>
            You can still buy {{ ticketsToBuyLeft }} Tickets for this event!
          </p>
        </div>
        <div class="container-fluid">
          <div class="seating-container" :ref="'cont'" draggable="false">
            <div class="col" v-for="col in cols" v-bind:key="'col_' + col">
              <div
                :ref="'seat_' + col + '_' + row"
                @click="selectTicket(col, row)"
                data-status=""
                :data-row="row"
                :data-col="col"
                class="seat"
                v-for="row in rows"
                v-bind:key="'seat_' + row"
              ></div>
            </div>
          </div>
        </div>
        <div class="container" v-if="!hasSeatMapping">
          <p>
            Unfortunately, this event does not have a seat map available. You
            can still buy tickets, check the event website for more information
            on the ticket categories.
          </p>
          <div class="tickets">
            <div
              class="ticket"
              v-for="ticket in fungibleTickets"
              :key="'ticket_f_' + ticket.typeId"
            >
              <p class="bold">{{ ticket.title }}</p>
              <button
                class="md-button md-raised"
                @click="selectTicketDirectly(ticket)"
              >
                select
              </button>
            </div>
            <div
              class="ticket"
              v-for="ticket in nonFungibleTickets"
              :key="'ticket_nf_' + ticket.typeId"
            >
              <p class="bold">{{ ticket.title }}</p>
              <button
                class="md-button md-raised"
                @click="selectTicketDirectly(ticket)"
              >
                select
              </button>
            </div>
          </div>
        </div>
      </section>
      <!-- Presale -->
      <section>
        <div class="container">
          <h2>Presale</h2>
          <div
            class="presale-type"
            v-for="ticket in fungibleTicketsWithPresale"
            v-bind:key="'presale_fungible_' + ticket.typeId"
          >
            <div class="presale">
              <md-card>
                <md-card-content>
                  <div class="md-card-title">{{ ticket.title }}</div>
                  <md-button @click="joinPresale(ticket)">Join</md-button>
                </md-card-content>
              </md-card>
            </div>
          </div>
          <div
            class="presale-type"
            v-for="ticket in nonFungibleTicketsWithPresale"
            v-bind:key="'presale_nonfungible_' + ticket.typeId"
          ></div>
          <div
            v-if="
              fungibleTicketsWithPresale.length === 0 &&
                nonFungibleTicketsWithPresale.length === 0
            "
          >
            <p>This event does not have any active presales</p>
          </div>
        </div>
      </section>
      <!-- aftermarket -->
      <section class="aftermarket">
        <div class="container">
          <h2>Aftermarket</h2>
          <div
            class="ticket-type-am"
            v-for="ticket in fungibleTickets"
            v-bind:key="'fungible_' + ticket.typeId"
          >
            <h3>{{ ticket.title }}</h3>
            <div class="moving lower">
              <md-card class="queue-wrapper buying">
                <div class="top">
                  <div class="chart-wrapper">
                    <chart-test
                      v-bind:chartId="`${ticket.typeId}_buy`"
                      v-bind:chartdata="{
                        labels: getPercentagesFromTicket(ticket),
                        datasets: [
                          {
                            label: 'orders',
                            borderWidth: 2,
                            backgroundColor: '#1dba9d',
                            borderColor: 'white',
                            data: getOrdersFromTicket(ticket, 'buy').map(
                              (o) => o.amount
                            ),
                          },
                        ],
                      }"
                    />
                  </div>
                </div>
                <div class="bottom">
                  <md-card-content v-if="ticketsToBuyLeft === 0">
                    You already own the maximum allowed tickets for this event.
                  </md-card-content>
                  <md-card-expand v-else>
                    <md-card-actions md-alignment="space-between">
                      <p>
                        buying queue
                      </p>
                      <md-card-expand-trigger>
                        <md-button class="md-icon-button">
                          <md-icon>keyboard_arrow_down</md-icon>
                        </md-button>
                      </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                      Join queue at
                      <div class="selection">
                        <md-field>
                          <md-select
                            md-dense
                            v-model="queueToJoin"
                            name="queue"
                            id="queue"
                          >
                            <md-option
                              v-for="perc in getPercentagesFromTicket(ticket)"
                              v-bind:key="'ticket.typeId_buying_' + perc"
                              :value="perc"
                            >
                              {{ perc }}%
                            </md-option>
                          </md-select>
                        </md-field>
                      </div>
                      <md-button @click="createBuyOrder(ticket)"
                        >Join</md-button
                      >
                    </md-card-expand-content>
                    <div></div>
                  </md-card-expand>
                </div>
              </md-card>
            </div>

            <div class="moving lower">
              <md-card class="queue-wrapper selling">
                <div class="top">
                  <div class="chart-wrapper">
                    <chart-test
                      v-bind:chartId="`${ticket.typeId}_sell`"
                      v-bind:chartdata="{
                        labels: getPercentagesFromTicket(ticket),
                        datasets: [
                          {
                            label: 'orders',
                            borderWidth: 2,
                            backgroundColor: '#1dba9d',
                            borderColor: 'white',
                            data: getOrdersFromTicket(ticket, 'sell').map(
                              (o) => o.amount
                            ),
                          },
                        ],
                      }"
                    />
                  </div>
                </div>
                <div class="bottom">
                  <md-card-content v-if="ticketsToBuyLeft === 0">
                    You already own the maximum allowed tickets for this event.
                  </md-card-content>
                  <md-card-expand v-else>
                    <md-card-actions md-alignment="space-between">
                      <p>
                        selling queue
                      </p>
                      <md-card-expand-trigger>
                        <md-button class="md-icon-button">
                          <md-icon>keyboard_arrow_down</md-icon>
                        </md-button>
                      </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                      <div
                        v-if="getOrdersFromTicket(ticket, 'sell').length > 0"
                      >
                        Buy for
                        <div class="selection">
                          <md-field>
                            <md-select
                              md-dense
                              v-model="queueToJoin"
                              name="queue"
                              id="queue"
                            >
                              <md-option
                                v-for="order in getOrdersFromTicket(
                                  ticket,
                                  'sell'
                                ).filter((o) => o.amount > 0)"
                                v-bind:key="
                                  'ticket.typeId_buying_' + order.percentage
                                "
                                :value="order.percentage"
                              >
                                {{ order.percentage }}%
                              </md-option>
                            </md-select>
                          </md-field>
                        </div>
                        <md-button @click="fillSellOrderFungible(ticket)"
                          >Buy</md-button
                        >
                      </div>
                      <div v-else>
                        <p>No tickets currently for sale in this category</p>
                      </div>
                    </md-card-expand-content>
                  </md-card-expand>
                </div>
              </md-card>
            </div>
          </div>
          <div
            class="ticket-type-am"
            v-for="ticket in nonFungibleTickets"
            v-bind:key="'nonfungible_' + ticket.typeId"
          >
            <h3>{{ ticket.title }}</h3>
            <div class="moving lower">
              <md-card class="queue-wrapper buying">
                <div class="top">
                  <div class="chart-wrapper">
                    <chart-test
                      v-bind:chartId="`${ticket.typeId}_nf_buy`"
                      v-bind:chartdata="{
                        labels: getPercentagesFromTicket(ticket),
                        datasets: [
                          {
                            label: 'orders',
                            borderWidth: 2,
                            backgroundColor: '#1dba9d',
                            borderColor: 'white',
                            data: getOrdersFromTicket(ticket, 'buy').map(
                              (o) => o.amount
                            ),
                          },
                        ],
                      }"
                    />
                  </div>
                </div>
                <div class="bottom">
                  <md-card-content v-if="ticketsToBuyLeft === 0">
                    You already own the maximum allowed tickets for this event.
                  </md-card-content>
                  <md-card-expand v-else>
                    <md-card-actions md-alignment="space-between">
                      <p>
                        buying queue
                      </p>
                      <md-card-expand-trigger>
                        <md-button class="md-icon-button">
                          <md-icon>keyboard_arrow_down</md-icon>
                        </md-button>
                      </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                      Join queue at
                      <div class="selection">
                        <md-field>
                          <md-select
                            md-dense
                            v-model="queueToJoin"
                            name="queue"
                          >
                            <md-option
                              v-for="perc in getPercentagesFromTicket(ticket)"
                              v-bind:key="'ticket.typeId_buying_' + perc"
                              :value="perc"
                            >
                              {{ perc }}%
                            </md-option>
                          </md-select>
                        </md-field>
                      </div>
                      <md-button @click="createBuyOrder(ticket)"
                        >Join</md-button
                      >
                    </md-card-expand-content>
                    <div></div>
                  </md-card-expand>
                </div>
              </md-card>
            </div>
            <div class="moving lower">
              <md-card class="queue-wrapper nf">
                <div class="top">
                  <h3>Tickets for sale</h3>
                </div>
                <div class="bottom">
                  <md-card-content v-if="ticketsToBuyLeft === 0">
                    You already own the maximum allowed tickets for this event.
                  </md-card-content>
                  <md-card-expand v-else>
                    <md-card-actions md-alignment="space-between">
                      <p>
                        {{ allSellOferingsNfTicketType(ticket).length }} tickets
                      </p>
                      <md-card-expand-trigger>
                        <md-button class="md-icon-button">
                          <md-icon>keyboard_arrow_down</md-icon>
                        </md-button>
                      </md-card-expand-trigger>
                    </md-card-actions>
                    <md-card-expand-content>
                      <div class="sell-offers-nf">
                        <div
                          class="sell-offering"
                          v-for="(offering,
                          index) in allSellOferingsNfTicketType(ticket)"
                          v-bind:key="'sellOffering_' + index"
                        >
                          <span class="ticket-number"
                            >Seat Number {{ offering.ticketId }}</span
                          >
                          <span class="percentage"
                            >{{ offering.percentage }}%</span
                          >
                          <span
                            class="fill-sell"
                            @click="
                              fillSellOrderNonFungible(
                                ticket.typeId,
                                offering.ticketId,
                                offering.percentage,
                                ticket.price
                              )
                            "
                          >
                            <md-icon>shop</md-icon>
                          </span>
                        </div>
                      </div>
                    </md-card-expand-content>
                  </md-card-expand>
                </div>
              </md-card>
            </div>
          </div>
        </div>
      </section>
    </div>

    <SelectionView
      v-bind:ticketId="selection.ticketId"
      v-bind:ticketTypeId="selection.ticketTypeId"
      v-bind:eventContractAddress="selection.eventContractAddress"
      v-bind:isNf="selection.isNf"
      v-bind:open="selection.active"
      v-bind:exchangeRate="exchangeRate"
      v-on:close="clearSelection"
    ></SelectionView>
  </div>
</template>

<script>
import ChartTest from "./../components/ChartTest.vue";
import axios from "axios";

import SelectionView from "./SelectionView";
import {
  hasSellOrder,
  numberFreeSeats,
  isFree,
  getNumBuyOrdersByPercent,
  getNumSellOrdersByPercent,
  getAllSellOferingsNfTicketType,
  fillSellOrderNonFungible,
  makeBuyOrderNonFungible,
  makeBuyOrderFungible,
  getNumSellOrders,
  fillSellOrderFungible,
  joinPresale,
} from "./../util/tickets";
export default {
  name: "Event",
  data() {
    return {
      exchangeRate: 0,
      event: {},
      activeQueueTip: {
        ticketType: 0,
        index: 0,
        type: "",
        isNf: false,
      },
      hasSeatMapping: false,
      queueToJoin: "0",
      aftermarket_price: 0,
      showDialog: false,
      contractAddress: Number,
      tabs: ["about", "tickets-plan", "aftermarket", "checkout"],
      rows: 0,
      cols: 0,
      navbarHeight: 0,
      selectedQueue: {},
      selection: {
        active: false,
        ticketId: 0,
        ticketTypeId: 0,
        price: 0,
        eventContractAddress: "",
        isNf: false,
      },
      //tickets: [{ name: "fungible", price: 50 }],
    };
  },
  components: {
    SelectionView,
    ChartTest,
  },
  props: {},
  computed: {
    approver() {
      return this.event.identityContractAddress
        ? this.$store.state.approvers.find(
            (a) =>
              String(a.approverAddress) ===
              String(this.event.identityContractAddress)
          )
        : undefined;
    },
    eventWebsite() {
      return this.event.website
        ? this.event.website
        : { verification: "pending" };
    },
    eventTwitter() {
      return this.event.twitter
        ? this.event.twitter
        : { verification: "pending" };
    },
    approverTitle() {
      return this.approver ? this.approver.title : "";
    },
    approverTwitter() {
      return this.approver
        ? this.approver.twitter
        : { verification: "pending" };
    },
    approverWebsite() {
      return this.approver
        ? this.approver.website
        : { verification: "pending" };
    },
    requiredIdentityLevel() {
      return Number(this.event.identityLevel);
    },
    requiredIdentityMethod() {
      return (
        this.approver &&
        this.approver.getMethodFromLevel(this.requiredIdentityLevel)
      );
    },
    userIsApproved() {
      return (
        this.approver &&
        this.$store.state.activeUser &&
        this.$store.state.activeUser.approvalLevels &&
        this.$store.state.activeUser.approvalLevels[
          this.approver.approverAddress
        ] &&
        Number(
          this.$store.state.activeUser.approvalLevels[
            this.approver.approverAddress
          ].level
        ) >= this.requiredIdentityLevel
      );
    },
    fungibleTickets() {
      return this.event.fungibleTickets ? this.event.fungibleTickets : [];
    },
    nonFungibleTickets() {
      return this.event.nonFungibleTickets ? this.event.nonFungibleTickets : [];
    },
    fungibleTicketsWithPresale() {
      return this.event.fungibleTickets
        ? this.event.fungibleTickets.filter((t) => t.presaleSupply > 0)
        : [];
    },
    nonFungibleTicketsWithPresale() {
      return this.event.nonFungibleTickets
        ? this.event.nonFungibleTickets.filter((t) => t.presaleSupply > 0)
        : [];
    },
    lowest_price() {
      try {
        return this.$store.state.web3.web3Instance.utils.fromWei(
          String(this.event.getLowestPrice())
        );
      } catch (e) {
        return 0;
      }
    },
    ticketsToBuyLeft() {
      return this.event && this.$store.state.activeUser
        ? this.max_tickets -
            this.$store.state.activeUser.ticketsOwnedForEvent(this.event_id)
        : 0;
    },
    max_tickets() {
      return this.event ? this.event.maxTicketsPerPerson : 0;
    },
    event_date() {
      try {
        return this.event.getTimeAndDate();
      } catch (e) {
        return 0;
      }
    },

    tickets() {
      if (this.$store.state.events[this.event_id]) {
        return this.$store.state.events[this.event_id].tickets;
      } else {
        return [];
      }
    },
  },
  watch: {},
  methods: {
    handleScroll(e) {
      let scroll = e.originalTarget
        ? e.originalTarget.scrollTop
        : e.target
        ? e.target.scrollTop
        : 1000;

      for (const ref of document.getElementsByClassName("event-information")) {
        if (scroll + 543 >= ref.offsetTop + ref.offsetHeight) {
          ref.classList.remove("lower");
        }
      }
      for (const ref of document.getElementsByClassName("moving")) {
        if (scroll + 543 >= ref.offsetTop + ref.offsetHeight - 50) {
          ref.classList.remove("lower");
        }
      }
      if (scroll >= 10) {
        this.$refs["firstinfo"].classList.remove("higher");
      } else {
        this.$refs["firstinfo"].classList.add("higher");
      }
    },
    getPriceConverted(value) {
      return (this.exchangeRate * value).toFixed(2);
    },
    async getEthPrice() {
      const response = await axios.get(
        "https://trust-certificates.herokuapp.com/api/exchange/eth-chf",
        {
          timeout: 5000,
        }
      );
      let eth_chf;
      if (Number(response.status) === 200) {
        eth_chf = response.data.data["1027"].quote.CHF.price;
        this.exchangeRate = eth_chf;
      }
    },
    getPercentagesFromTicket(ticket) {
      let percentages = [];
      for (let i = 1; i <= ticket.aftermarketGranularity; i++) {
        percentages.push((100 / ticket.aftermarketGranularity) * i);
      }
      return percentages;
    },
    getOrdersFromTicket(ticket, buyOrSell) {
      let orders = [];
      if (buyOrSell === "buy") {
        for (let i = 1; i <= ticket.aftermarketGranularity; i++) {
          const num = this.numBuyOrdersByPercent(
            ticket,
            (100 / ticket.aftermarketGranularity) * i
          );
          orders.push({
            percentage: (100 / ticket.aftermarketGranularity) * i,
            amount: num,
          });
        }
      } else {
        for (let i = 1; i <= ticket.aftermarketGranularity; i++) {
          const num = this.numSellOrdersByPercent(
            ticket,
            (100 / ticket.aftermarketGranularity) * i
          );
          orders.push({
            percentage: (100 / ticket.aftermarketGranularity) * i,
            amount: num,
          });
        }
      }
      return orders;
    },
    showJoinButton(ticketType, percentage) {
      this.selectedQueue.ticketType = ticketType;
      this.selectedQueue.percentage = percentage;
    },
    async createBuyOrder(ticketType) {
      this.$root.$emit("transactionStarted");

      if (ticketType.isNf) {
        const result = await makeBuyOrderNonFungible(
          ticketType.typeId,
          1,
          this.queueToJoin,
          ticketType.price,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          ticketType.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      } else {
        const result = await makeBuyOrderFungible(
          ticketType.typeId,
          1,
          this.queueToJoin,
          ticketType.price,
          this.$store.state.activeUser.account,
          this.$store.state.web3.web3Instance,
          ticketType.eventContractAddress
        );
        this.$root.$emit("openMessageBus", result);
      }
      this.$root.$emit("transactionEnded");

      await this.$store.dispatch(
        "updateEvent",
        ticketType.eventContractAddress
      );
      this.$root.$emit("userUpdated");
      this.$root.$emit("updateCharts");
    },
    async joinPresale(ticket) {
      this.$root.$emit("transactionStarted");

      const result = await joinPresale(
        ticket,
        this.$store.state.activeUser.account,
        this.$store.state.web3.web3Instance,
        this.event.contractAddress
      );
      this.$root.$emit("transactionEnded");

      await this.$store.dispatch("updateEvent", this.event.ContractAddress);
      this.$root.$emit("openMessageBus", result);
    },
    async fillSellOrderNonFungible(ticketTypeId, ticketId, percentage, price) {
      this.$root.$emit("transactionStarted");
      const result = await fillSellOrderNonFungible(
        ticketTypeId,
        ticketId,
        percentage,
        price,
        this.$store.state.activeUser.account,
        this.$store.state.web3.web3Instance,
        this.event.contractAddress
      );
      this.$root.$emit("transactionEnded");
      await this.$store.dispatch("updateEvent", this.event.contractAddress);
      this.$root.$emit("openMessageBus", result);
    },
    async fillSellOrderFungible(ticketType) {
      this.$root.$emit("transactionStarted");
      const result = await fillSellOrderFungible(
        ticketType.typeId,
        1,
        ticketType.price,
        this.queueToJoin,
        this.$store.state.activeUser.account,
        this.$store.state.web3.web3Instance,
        this.event.contractAddress
      );
      this.$root.$emit("transactionEnded");
      await this.$store.dispatch(
        "updateEvent",
        ticketType.eventContractAddress
      );
      this.$root.$emit("openMessageBus", result);
    },
    setActiveQueueTip(ticket) {
      this.activeQueueTip.ticketType = ticket;
    },
    numSellOrdersFungible(ticket) {
      return getNumSellOrders(ticket);
    },
    numSellOrdersByPercent(ticket, percentage) {
      return getNumSellOrdersByPercent(ticket, percentage);
    },
    numBuyOrdersByPercent(ticket, percentage) {
      return getNumBuyOrdersByPercent(ticket, percentage);
    },
    allSellOferingsNfTicketType(ticket) {
      return getAllSellOferingsNfTicketType(ticket);
    },
    getTicketType(ticket) {
      for (const ticketType of this.event.nonFungibleTickets) {
        if (ticketType.typeId == ticket.ticketTypeId) {
          return ticketType;
        }
      }
    },
    clearSelection() {
      this.selection = {
        active: false,
        ticketId: 0,
        price: 0,
        ticketTypeId: 0,
        isNf: false,
        amount: 1,
      };
    },
    findTicketIndex(col, row) {
      let found_ticket = false;
      this.event.fungibleTickets.forEach(function(ticketType) {
        ticketType.seatMapping.forEach(function(mapping) {
          if (
            Number(mapping.split("/")[0]) == col &&
            Number(mapping.split("/")[1]) == row
          ) {
            found_ticket = ticketType;
          }
        });
      });
      if (found_ticket) {
        return found_ticket;
      }
      this.event.nonFungibleTickets.forEach(function(ticketType) {
        ticketType.tickets.forEach(function(ticket) {
          if (
            Number(ticket.seatMapping.split("/")[0]) == col &&
            Number(ticket.seatMapping.split("/")[1]) == row
          ) {
            found_ticket = ticket;
          }
        });
      });
      return found_ticket;
    },
    selectTicket: async function(col, row) {
      //const seat = this.$refs[`seat_${col}_${row}`];
      const ticket = this.findTicketIndex(col, row);
      this.selection.ticket = ticket;
      if (ticket.isNf) {
        this.selection.ticketId = Number(ticket.ticketId);
        this.selection.ticketTypeId = Number(ticket.ticketTypeId);
        this.selection.isNf = true;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      } else {
        this.selection.ticketTypeId = Number(ticket.typeId);
        this.selection.ticketId = 0;
        this.selection.isNf = false;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      }
      this.selection.active = true;
      //await this.buyTicket(selected_ticket.typeIndex, selected_ticket.index, selected_ticket.price, selected_ticket.isNF)
    },
    selectTicketDirectly(ticket) {
      this.selection.ticket = ticket;
      if (ticket.isNf) {
        this.selection.ticketId = ticket.ticketId;
        this.selection.ticketTypeId = ticket.ticketTypeId;
        this.selection.isNf = true;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      } else {
        this.selection.ticketTypeId = ticket.typeId;
        this.selection.ticketId = 0;
        this.selection.isNf = false;
        this.selection.eventContractAddress = ticket.eventContractAddress;
      }
      this.selection.active = true;
    },
    toggleTab: function(tab) {
      this.tabs.forEach((t) => {
        this.$refs[t].classList.remove("active");
        this.$refs[`content-${t}`].classList.remove("active");
      });
      this.$refs[tab].classList.add("active");
      this.$refs[`content-${tab}`].classList.add("active");
      if (
        tab === "tickets-plan" ||
        tab === "checkout" ||
        tab == "aftermarket"
      ) {
        this.navbarHeight =
          this.$refs["navigation"].getBoundingClientRect().height +
          this.$refs["headerTitle"].getBoundingClientRect().height;
        this.$refs["teaser"].style.minHeight = `${this.navbarHeight}px`;
        this.$refs["headerTitle"].style.transform = `translateX(-120%)`;
        //this.$refs['teaser'].style.alignItems = `start`;
        //this.$refs['parallax'].classList.add('hidden');
        this.$refs["navigation"].classList.add("top");
      } else {
        this.$refs["teaser"].style.justifyContent = `start`;
        this.$refs["headerTitle"].style.transform = `translateX(0)`;

        this.$refs["teaser"].style.minHeight = "250px";
        //this.$refs['parallax'].classList.remove('hidden');
        this.$refs["navigation"].classList.remove("top");
      }
    },
    fetchEventInfo: function() {
      this.event = this.$store.state.events.filter(
        (event) => event.contractAddress == this.contractAddress
      )[0];
      if (!this.event) {
        this.event = {};
      }
      //this.markSeats();
    },
    fetchTicketInfo: function() {
      this.setGridSizes();
      setTimeout(() => {
        this.markSeats();
      }, 1000);
    },
    setGridSizes: function() {
      let max_row = 0;
      let max_col = 0;
      if (!this.event.fungibleTickets) {
        return;
      }
      this.event.fungibleTickets.forEach((ticket) => {
        ticket.seatMapping.forEach((mapping) => {
          max_col =
            Number(mapping.split("/")[0]) > max_col
              ? Number(mapping.split("/")[0])
              : max_col;
          max_row =
            Number(mapping.split("/")[1]) > max_row
              ? Number(mapping.split("/")[1])
              : max_row;
        });
      });
      this.event.nonFungibleTickets.forEach((nfticketType) => {
        nfticketType.tickets.forEach((ticket) => {
          max_row =
            max_row > ticket.seatMapping.split("/")[1]
              ? max_row
              : Number(ticket.seatMapping.split("/")[1]);
          max_col =
            max_col > ticket.seatMapping.split("/")[0]
              ? max_col
              : Number(ticket.seatMapping.split("/")[0]);
        });
      });
      this.rows = max_row;
      this.cols = max_col;
      if (this.rows > 0 && this.cols > 0) {
        this.hasSeatMapping = true;
      }
      this.$refs[
        "cont"
      ].style.gridTemplateColumns = `repeat(${this.cols},minmax(25px,1fr))`;
      this.$refs["cont"].style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    },
    markSeats: function() {
      if (!this.event.contractAddress) {
        return;
      }
      this.event.fungibleTickets.forEach((ticket) => {
        ticket.seatMapping.forEach((mapping) => {
          let x = Number(mapping.split("/")[0]);
          let y = Number(mapping.split("/")[1]);
          // console.log(x, y);
          // check if this fungible category still has seats available
          const seat = this.$refs[`seat_${x}_${y}`];
          seat[0].classList.add("fungible");
          seat[0].style.backgroundColor = ticket.color;
          if (numberFreeSeats(ticket) > ticket.supply / 2) {
            seat[0].dataset.status = "good";
          } else if (numberFreeSeats(ticket) > ticket.supply / 4) {
            seat[0].dataset.status = "neutral";
          } else {
            seat[0].dataset.status = "bad";
          }
        });
      });
      this.event.nonFungibleTickets.forEach(function(ticketType) {
        ticketType.tickets.forEach(function(ticket) {
          let x = Number(ticket.seatMapping.split("/")[0]);
          let y = Number(ticket.seatMapping.split("/")[1]);

          const seat = this.$refs[`seat_${x}_${y}`];
          //console.log(seat);
          seat[0].style.backgroundColor = ticketType.color;
          if (isFree(ticket)) {
            seat[0].dataset.status = "free";
          } else {
            if (hasSellOrder(ticket)) {
              seat[0].dataset.status = "forsale";
            } else {
              seat[0].dataset.status = "occupied";
            }
          }
        }, this);
      }, this);
    },
  },
  created() {
    this.contractAddress = this.$route.params.id;
    this.$root.$on("loadedEvents", () => {
      this.fetchEventInfo();
      this.fetchTicketInfo();
    });
  },
  mounted() {
    this.$root.$emit("hideSearchBar");
    this.fetchEventInfo();
    this.fetchTicketInfo();
    this.getEthPrice();
  },
};
</script>

<style scoped>
.container .md-card {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.aftermarket {
  padding-bottom: 4rem;
}
.event-info-wrapper {
  padding-bottom: 100px;
}
.event {
  min-height: var(--vh);
}
.header {
  position: sticky;
  top: 0;
  padding: 5px;
}
.tab-headers {
  padding: 1rem;
  border-radius: 12px;
  color: black;
  display: flex;
  justify-content: space-between;
  background: white;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
    0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.header h1 {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 400;
}
.ticket-category {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.ticket-info .ticket-title {
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 5px;
}
.ticket-available {
  color: var(--accent);
}
.ticket-info .ticket-price {
  opacity: 0.8;
}
.ticket-info span {
  display: block;
}
.return-arrow {
  position: absolute;
  top: 20px;
  left: 20px;
}
.return-arrow a {
  border-bottom: none;
}
.return-arrow .md-icon {
  color: white;
}
.event-info-wrapper {
  display: none;
}
.event-info-wrapper.active {
  display: block;
}
.header-img {
  min-height: 150px;
}
.header-img .img-fluid {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  width: 100%;
}
.header-img .event-header {
  z-index: 999;
  transition: transform 0.3s linear;
}
.event-header span {
  color: white;
  display: block;
}
.event-header .event-cat {
  opacity: 0.8;
}
.event-header .event-title {
  font-size: 1.3rem;
  margin-bottom: 10px;
}
.header-img .tabs {
  width: 100%;
  display: flex;
  margin-bottom: 1rem;
  position: relative;
}

.tabs .tab {
  flex-basis: 50%;
  padding-bottom: 1rem;
  text-align: center;
  transition: color 0.3s ease-in-out;
}
.tabs .tab.active {
  color: var(--orange);
}
.tabs .underline {
  position: absolute;
  width: 25%;
  height: 2px;
  background: var(--orange);
  left: 0;
  bottom: 0;
  transition: transform 0.3s ease-in-out;
}
.tabs .underline.moved {
  transform: translateX(100%);
}
.event-title {
  display: inline-block;
}
.description {
  margin-bottom: 2rem;
}
.info-title {
  display: inline-block;
  color: var(--accent);
  min-width: 30px;
}
.info-title.md-icon {
  color: var(--accent);
}
.info-value {
  display: inline-block;
  color: var(--fg);
  min-width: 100px;
}
.event-info {
  padding: 10px;
}
.parallax {
  /* The image used */

  /* Set a specific height */

  /* Create the parallax scrolling effect */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(4px);
  position: relative;
}
.parallax.hidden {
  display: none;
}

.seating-container {
  padding: 5px;
  margin-top: 2rem;
  width: max-content;
  background-color: #d8dee9;
  display: grid;
  /*grid-gap: 2px;*/
  width: 100%;
  overflow-x: scroll;
}
.seat {
  /*margin-bottom: 2px;*/
  background-color: #d8dee9;
  height: 100%;
  border: 2px solid #d8dee9;
  transition: transform 0.8s linear, background-color 0.3s linear;
}
.seat.fungible {
  border: none;
  /*transform: scale(1.1);*/
}
.seat.fungible[data-status="good"] {
  background-color: #a3be8c;
  cursor: pointer;
}
.seat.fungible[data-status="neutral"] {
  background-color: #ebcb8b;
  cursor: pointer;
}
.seat.fungible[data-status="bad"] {
  background-color: #bf616a;
}
.seat.selected {
  border: 1px solid black;
}
.seat[data-status="free"] {
  background-color: #a3be8c;
  cursor: pointer;
}
.seat[data-status="occupied"] {
  background-color: #bf616a;
}
.seat[data-status="forsale"] {
  background-color: #ebcb8b;
}
.seat.bought {
  background-color: #bf616a !important;
}

.tooltip span {
  display: block;
}
.tooltip .ticket-title {
  display: flex;
  justify-content: space-between;
}
.tooltip .ticket-title h2 {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 0;
  margin-bottom: 0.2rem;
  font-size: 1.3rem;
}
.tooltip .ticket-title span {
  font-size: 1.2rem;
}
.ticket-supply.active {
  display: block;
}
.ticket-supply {
  display: none;
  font-weight: lighter;
  margin-bottom: 1rem;
}
.ticket-supply[data-status="good"] {
  color: #a3be8c;
}
.ticket-supply[data-status="neutral"] {
  color: #ebcb8b;
}
.ticket-supply[data-status="bad"] {
  color: #bf616a;
}
.ticket-status[data-status="free"] {
  color: #a3be8c;
}
.ticket-status[data-status="sold"] {
  color: #bf616a;
}

.buy-selection,
.selection-step {
  display: none;
}
.buy-selection.active,
.selection-step.active {
  display: block;
}
.buy-selection .icon-wrap {
  cursor: pointer;
}

.queue-wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 0.2rem;
  /* border-radius: 12px; */
  /* border: 1px solid rgba(0, 0, 0, 0.171); */
  margin-bottom: 1rem;
}
.queue-wrapper .top {
  flex: 0 0 100%;
  background: #1dba9d;
  color: white;
}
.queue-wrapper.nf .top {
  padding: 2rem;
}
.queue-wrapper .bottom {
  flex: 0 0 100%;
  padding: 0.5rem;
}
.bottom .selection {
  max-width: 80px;
  display: inline-block;
}
.bottom p {
  margin: 0;
}
.queue-wrapper.selected {
  border: 1px solid var(--red);
}

.queue-wrapper .chart-wrapper {
  flex-basis: 100%;
  flex-shrink: 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}
.queue-wrapper .queue {
}
.queue-wrappr .queue-interact {
  flex-basis: 100%;
  flex-grow: 0;
  flex-shrink: 0;
}
.step {
  height: 20px;
  width: 100%;
  background-color: var(--green);
}
.step-wrapper {
  margin-right: 1rem;
  bottom: 0%;
  background-color: white;
  height: 20px;
  width: 20px;
  display: flex;
  align-items: flex-end;
}
.step[data-orders="0"] {
  background-color: var(--red);
  height: 5px;
}
.step[data-orders="1"],
.step[data-orders="2"],
.step[data-orders="3"] {
  background-color: var(--orange);
  height: 10px;
}
.step[data-orders="4"],
.step[data-orders="5"] {
  background-color: var(--yellow);
  height: 15px;
}

.sell-offering {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.fill-sell {
  cursor: pointer;
}

.info-group.split {
  display: flex;
  justify-content: space-between;
}
.info-group .danger i {
  color: var(--red);
}
.info-group .good i {
  color: var(--green);
}

.tooltip {
  position: relative;
}
.tooltip:after {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  content: attr(data-tooltip);
  padding: 6px 10px;
  top: 1.4em;
  left: 50%;
  -webkit-transform: translateX(-50%) translateY(-2px);
  transform: translateX(-50%) translateY(-2px);
  background: grey;
  color: white;
  white-space: nowrap;
  z-index: 2;
  border-radius: 2px;
  -webkit-transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1),
    -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
  transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1),
    -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
  transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1),
    transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
  transition: opacity 0.2s cubic-bezier(0.64, 0.09, 0.08, 1),
    transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1),
    -webkit-transform 0.2s cubic-bezier(0.64, 0.09, 0.08, 1);
}
.tooltip:hover:after {
  display: block;
  opacity: 1;
  visibility: visible;
  -webkit-transform: translateX(-50%) translateY(0);
  transform: translateX(-50%) translateY(0);
}

.ticket {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
p.bold {
  font-weight: bold;
}

.event-information,
.queue-wrapper,
.moving {
  transition: 0.3s ease-in-out;
  transform: translateY(0px);
  opacity: 1;
}

.event-information.higher {
  transform: translateY(-80px);
}
.event-information.lower,
.queue-wrapper.lower,
.moving.lower {
  transform: translateY(150px);
  opacity: 0;
}
</style>
