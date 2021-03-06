import HideElement from "@root/helpers/HideElement";
import { Flex, LabelDeprecated } from "@style-guide";
import type { FlexElementType } from "@style-guide/Flex";
import type { LabelElementType } from "@style-guide/LabelDeprecated";
import moment from "moment-timezone";
import { ContentClassTypes } from "../../Fetcher/Fetcher";
import type QueueClassType from "../Queue";

export default class Reported {
  main: QueueClassType;

  query: {
    startingDate?: string;
    endingDate?: string;
    startingDateMoment?: moment.Moment;
    endingDateMoment?: moment.Moment;
  };

  labelContainer: FlexElementType;
  label: LabelElementType;
  labelText: Text;

  constructor(main: QueueClassType) {
    this.main = main;
  }

  SetQuery(startingDate?: string, endingDate?: string) {
    if (!startingDate || !endingDate) {
      this.HideLabel();

      return;
    }

    moment.locale(navigator.language);

    this.query = {
      startingDate,
      endingDate,
      startingDateMoment: moment(startingDate).tz(
        System.data.Brainly.defaultConfig.config.data.config.timezone,
        true,
      ),
      endingDateMoment: moment(endingDate).tz(
        System.data.Brainly.defaultConfig.config.data.config.timezone,
        true,
      ),
    };

    if (this.query.startingDateMoment > this.query.endingDateMoment) {
      [this.query.startingDate, this.query.endingDate] = [
        this.query.endingDate,
        this.query.startingDate,
      ];
      [this.query.startingDateMoment, this.query.endingDateMoment] = [
        this.query.endingDateMoment,
        this.query.startingDateMoment,
      ];
    }

    this.query.startingDateMoment = this.query.startingDateMoment.set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    this.query.endingDateMoment = this.query.endingDateMoment.set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 0,
    });

    this.ShowLabel();
    this.main.main.fetcher.FilterContents();
    this.main.main.queue.ShowContents();
  }

  HideLabel(event?: MouseEvent) {
    this.query = {};

    if (event)
      this.main.options.option.contentFilters.filter.reportingDate.ResetDates();

    HideElement(this.labelContainer);
    this.main.main.fetcher?.FilterContents();
    this.main.main.queue.ShowContents();
  }

  ShowLabel() {
    if (!this.labelContainer) this.RenderLabel();

    this.labelText.nodeValue = String(
      `${this.query.startingDate} ↔ ${this.query.endingDate}`,
    );

    this.main.main.filterLabelContainer.append(this.labelContainer);
  }

  RenderLabel() {
    this.labelContainer = Flex({
      margin: "xxs",
      children: this.label = LabelDeprecated({
        icon: {
          type: "calendar",
        },
        onClose: this.HideLabel.bind(this),
        children: [
          `${
            //
            System.data.locale.reportedContents.options.filter.filters
              .reportingDate.name
          }:&nbsp; `,
          (this.labelText = document.createTextNode("")),
        ],
        color: "lavender",
      }),
    });
  }

  CompareContent(content: ContentClassTypes) {
    if (
      !this.query?.startingDateMoment ||
      !this.query?.endingDateMoment ||
      !content.dates.report?.moment
    )
      return true;

    const reportDate = content.dates.report.moment;

    return (
      reportDate >= this.query.startingDateMoment &&
      reportDate <= this.query.endingDateMoment
    );
  }
}
